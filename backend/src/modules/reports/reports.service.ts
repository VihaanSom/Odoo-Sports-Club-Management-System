import { prisma } from '../../config/prisma';
import {
  RevenueReportQuery,
  CourtsReportQuery,
  MembersReportQuery,
  InventoryReportQuery,
  BarReportQuery,
  StaffReportQuery,
} from './reports.schema';
import { MembershipTier } from '@prisma/client';

export class ReportsService {
  /**
   * Helper: Parse date range with safe fallbacks
   */
  private parseDateRange(fromStr?: string, toStr?: string): { fromDate: Date; toDate: Date } {
    const now = new Date();
    let fromDate: Date;
    let toDate: Date;

    if (fromStr) {
      fromDate = new Date(fromStr);
      if (isNaN(fromDate.getTime())) {
        fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      }
    } else {
      fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    }

    if (toStr) {
      toDate = new Date(toStr);
      if (isNaN(toDate.getTime())) {
        toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      } else {
        // If string is YYYY-MM-DD without time, set to end of day
        if (toStr.length <= 10) {
          toDate.setUTCHours(23, 59, 59, 999);
        }
      }
    } else {
      toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    }

    return { fromDate, toDate };
  }

  /**
   * Helper: Format period bucket string
   */
  private formatPeriodBucket(date: Date, granularity: 'day' | 'week' | 'month'): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    if (granularity === 'month') {
      return `${year}-${month}`;
    }

    if (granularity === 'week') {
      // Find Monday of the current week
      const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const dayOfWeek = d.getUTCDay();
      const diff = d.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      d.setUTCDate(diff);
      const wMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
      const wDay = String(d.getUTCDate()).padStart(2, '0');
      return `${d.getUTCFullYear()}-${wMonth}-${wDay}`;
    }

    return `${year}-${month}-${day}`;
  }

  /**
   * RP-01: Revenue Report
   */
  async getRevenueReport(query: RevenueReportQuery) {
    const { fromDate, toDate } = this.parseDateRange(query.from, query.to);
    const granularity = query.granularity || 'day';

    // 1. Fetch confirmed bookings
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        id: true,
        amountPaid: true,
        paymentMethod: true,
        createdAt: true,
      },
    });

    // 2. Fetch confirmed / fulfilled shop orders
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['confirmed', 'fulfilled'] },
        orderType: { in: ['in_store', 'online'] },
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        id: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
      },
    });

    // 3. Fetch bar payments
    const barPayments = await prisma.payment.findMany({
      where: {
        barTabId: { not: null },
        paidAt: { gte: fromDate, lte: toDate },
      },
      select: {
        id: true,
        amount: true,
        paymentMethod: true,
        paidAt: true,
      },
    });

    // 4. Summaries & Payment Method Aggregations
    let courtsPaise = 0;
    let shopPaise = 0;
    let barPaise = 0;

    const byPaymentMethod: Record<string, number> = {
      cash: 0,
      card: 0,
      upi: 0,
    };

    const addPaymentMethodAmount = (method: string | null | undefined, paise: number) => {
      if (!method) return;
      const m = method.toLowerCase();
      if (m in byPaymentMethod) {
        byPaymentMethod[m] += paise;
      } else {
        byPaymentMethod[m] = paise;
      }
    };

    // Time-series bucket map
    const timeSeriesMap = new Map<
      string,
      { courtsPaise: number; shopPaise: number; barPaise: number; totalPaise: number }
    >();

    const getOrCreateBucket = (period: string) => {
      let bucket = timeSeriesMap.get(period);
      if (!bucket) {
        bucket = { courtsPaise: 0, shopPaise: 0, barPaise: 0, totalPaise: 0 };
        timeSeriesMap.set(period, bucket);
      }
      return bucket;
    };

    // Process Bookings
    for (const b of bookings) {
      const paise = Math.round(Number(b.amountPaid) * 100);
      courtsPaise += paise;
      addPaymentMethodAmount(b.paymentMethod, paise);

      const period = this.formatPeriodBucket(b.createdAt, granularity);
      const bucket = getOrCreateBucket(period);
      bucket.courtsPaise += paise;
      bucket.totalPaise += paise;
    }

    // Process Orders
    for (const o of orders) {
      const paise = Math.round(Number(o.totalAmount) * 100);
      shopPaise += paise;
      addPaymentMethodAmount(o.paymentMethod, paise);

      const period = this.formatPeriodBucket(o.createdAt, granularity);
      const bucket = getOrCreateBucket(period);
      bucket.shopPaise += paise;
      bucket.totalPaise += paise;
    }

    // Process Bar Payments
    for (const bp of barPayments) {
      const paise = Math.round(Number(bp.amount) * 100);
      barPaise += paise;
      addPaymentMethodAmount(bp.paymentMethod, paise);

      const period = this.formatPeriodBucket(bp.paidAt, granularity);
      const bucket = getOrCreateBucket(period);
      bucket.barPaise += paise;
      bucket.totalPaise += paise;
    }

    const totalPaise = courtsPaise + shopPaise + barPaise;

    // Convert map to sorted time-series array
    const sortedPeriods = Array.from(timeSeriesMap.keys()).sort();
    const timeSeries = sortedPeriods.map((period) => ({
      period,
      ...timeSeriesMap.get(period)!,
    }));

    return {
      summary: {
        totalPaise,
        courtsPaise,
        shopPaise,
        barPaise,
      },
      byPaymentMethod,
      timeSeries,
    };
  }

  /**
   * RP-02: Court Utilisation Report
   */
  async getCourtsUtilisationReport(query: CourtsReportQuery) {
    const { fromDate, toDate } = this.parseDateRange(query.from, query.to);

    const courts = await prisma.court.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        slotStart: { gte: fromDate, lte: toDate },
      },
      select: {
        courtId: true,
        slotStart: true,
        slotEnd: true,
        amountPaid: true,
      },
    });

    // Calculate total days in range (inclusive)
    const diffDays = Math.max(
      1,
      Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    let totalClubBookableHours = 0;
    let totalClubBookedHours = 0;
    let totalClubRevenuePaise = 0;

    const courtMetrics = courts.map((court) => {
      // Parse operating hours
      const openParts = court.openTime.split(':').map(Number);
      const closeParts = court.closeTime.split(':').map(Number);
      const openHour = openParts[0] + (openParts[1] || 0) / 60;
      const closeHour = closeParts[0] + (closeParts[1] || 0) / 60;
      let dailyBookableHours = closeHour - openHour;
      if (dailyBookableHours <= 0) dailyBookableHours = 16; // default 16 bookable hours if wrap-around

      const totalBookableHours = Math.round(dailyBookableHours * diffDays);
      totalClubBookableHours += totalBookableHours;

      // Filter bookings for this court
      const courtBookings = bookings.filter((b) => b.courtId === court.id);
      let totalBookedHours = 0;
      let revenuePaise = 0;

      for (const b of courtBookings) {
        const start = new Date(b.slotStart).getTime();
        const end = new Date(b.slotEnd).getTime();
        const durationHours = Math.max(0, (end - start) / (1000 * 60 * 60));
        totalBookedHours += durationHours;
        revenuePaise += Math.round(Number(b.amountPaid || 0) * 100);
      }

      totalClubBookedHours += totalBookedHours;
      totalClubRevenuePaise += revenuePaise;

      const utilisationRatePct =
        totalBookableHours > 0
          ? Math.min(100, Math.round((totalBookedHours / totalBookableHours) * 10000) / 100)
          : 0;

      return {
        courtId: court.id,
        courtName: court.name,
        sport: court.sport,
        openTime: court.openTime,
        closeTime: court.closeTime,
        totalBookableHours,
        totalBookedHours: Math.round(totalBookedHours * 100) / 100,
        utilisationRatePct,
        totalBookings: courtBookings.length,
        totalRevenuePaise: revenuePaise,
      };
    });

    const overallUtilisationPct =
      totalClubBookableHours > 0
        ? Math.min(100, Math.round((totalClubBookedHours / totalClubBookableHours) * 10000) / 100)
        : 0;

    return {
      summary: {
        totalCourts: courts.length,
        daysAnalyzed: diffDays,
        totalBookableHours: totalClubBookableHours,
        totalBookedHours: Math.round(totalClubBookedHours * 100) / 100,
        overallUtilisationPct,
        totalBookings: bookings.length,
        totalRevenuePaise: totalClubRevenuePaise,
      },
      courts: courtMetrics,
    };
  }

  /**
   * RP-03: Member Analytics Report
   */
  async getMembersReport(query: MembersReportQuery) {
    const { fromDate, toDate } = this.parseDateRange(query.from, query.to);

    // New signups in range
    const newMembers = await prisma.member.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: { tier: true },
    });

    // Expirations in range
    const expiredMembers = await prisma.member.findMany({
      where: {
        membershipEnd: { gte: fromDate, lte: toDate },
      },
      select: { tier: true, status: true },
    });

    // Current active members breakdown
    const activeMembers = await prisma.member.findMany({
      where: { status: 'active' },
      select: { tier: true },
    });

    const tierBreakdown = (list: { tier: MembershipTier }[]) => {
      const counts: Record<string, number> = {
        Gold: 0,
        Silver: 0,
        Junior: 0,
      };
      for (const item of list) {
        if (item.tier in counts) {
          counts[item.tier]++;
        } else {
          counts[item.tier] = 1;
        }
      }
      return counts;
    };

    return {
      newSignups: {
        total: newMembers.length,
        byTier: tierBreakdown(newMembers),
      },
      expirations: {
        total: expiredMembers.length,
        byTier: tierBreakdown(expiredMembers),
      },
      activeMembers: {
        total: activeMembers.length,
        byTier: tierBreakdown(activeMembers),
      },
      totalMembers: await prisma.member.count(),
    };
  }

  /**
   * RP-04: Inventory Report
   */
  async getInventoryReport(_query: InventoryReportQuery) {
    // 1. Top-selling equipment
    const equipmentSales = await prisma.orderItemEquipment.groupBy({
      by: ['equipmentId'],
      _sum: { qty: true, subtotal: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 10,
    });

    const equipmentIds = equipmentSales.map((e) => e.equipmentId);
    const equipmentItems = await prisma.equipment.findMany({
      where: { id: { in: equipmentIds } },
    });
    const eqMap = new Map(equipmentItems.map((e) => [e.id, e]));

    const topSellingEquipment = equipmentSales.map((sale) => {
      const item = eqMap.get(sale.equipmentId);
      return {
        id: sale.equipmentId,
        name: item?.name ?? `Equipment #${sale.equipmentId}`,
        category: item?.category ?? 'accessory',
        stockQty: item?.stockQty ?? 0,
        lowStockThreshold: item?.lowStockThreshold ?? 5,
        totalQuantitySold: sale._sum.qty || 0,
        revenuePaise: Math.round(Number(sale._sum.subtotal || 0) * 100),
      };
    });

    // 2. Top-selling menu items
    const menuOrderSales = await prisma.orderItemMenu.groupBy({
      by: ['menuItemId'],
      _sum: { qty: true, subtotal: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 10,
    });

    const menuIds = menuOrderSales.map((m) => m.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuIds } },
    });
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    const topSellingMenuItems = menuOrderSales.map((sale) => {
      const item = menuMap.get(sale.menuItemId);
      return {
        id: sale.menuItemId,
        name: item?.name ?? `Menu Item #${sale.menuItemId}`,
        category: item?.category ?? 'food',
        stockQty: item?.stockQty ?? 0,
        lowStockThreshold: item?.lowStockThreshold ?? 5,
        totalQuantitySold: sale._sum.qty || 0,
        revenuePaise: Math.round(Number(sale._sum.subtotal || 0) * 100),
      };
    });

    // 3. Current low-stock items
    const lowStockEquipment = await prisma.equipment.findMany({
      where: {
        stockQty: { lte: prisma.equipment.fields.lowStockThreshold },
      },
      select: {
        id: true,
        name: true,
        category: true,
        stockQty: true,
        lowStockThreshold: true,
      },
    });

    const lowStockMenu = await prisma.menuItem.findMany({
      where: {
        stockQty: { lte: prisma.menuItem.fields.lowStockThreshold },
      },
      select: {
        id: true,
        name: true,
        category: true,
        stockQty: true,
        lowStockThreshold: true,
      },
    });

    return {
      topSellingEquipment,
      topSellingMenuItems,
      lowStockAlerts: {
        equipment: lowStockEquipment,
        menuItems: lowStockMenu,
      },
    };
  }

  /**
   * RP-05: Bar Earnings Report
   */
  async getBarReport(query: BarReportQuery) {
    const targetDate = query.date ? new Date(query.date) : new Date();
    const dayStart = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

    const tabs = await prisma.barTab.findMany({
      where: {
        openedAt: { gte: dayStart, lte: dayEnd },
      },
      include: {
        table: true,
        staff: true,
        items: {
          include: { menuItem: true },
        },
        payments: true,
      },
    });

    let totalEarningsPaise = 0;
    let settledTabsCount = 0;
    let openTabsCount = 0;

    const itemCounts = new Map<string, { name: string; qty: number; revenuePaise: number }>();
    const staffSales = new Map<number, { staffName: string; tabsOpened: number; earningsPaise: number }>();

    for (const tab of tabs) {
      if (tab.status === 'settled') {
        settledTabsCount++;
        for (const p of tab.payments) {
          totalEarningsPaise += Math.round(Number(p.amount) * 100);
        }
      } else if (tab.status === 'open') {
        openTabsCount++;
      }

      // Track items sold
      for (const item of tab.items) {
        const key = String(item.menuItemId);
        const existing = itemCounts.get(key) || {
          name: item.menuItem?.name || `Item #${item.menuItemId}`,
          qty: 0,
          revenuePaise: 0,
        };
        existing.qty += item.qty;
        existing.revenuePaise += Math.round(Number(item.subtotal) * 100);
        itemCounts.set(key, existing);
      }

      // Track staff activity
      const staffId = tab.openedBy;
      const staffName = `${tab.staff.firstName} ${tab.staff.lastName}`.trim();
      const sExisting = staffSales.get(staffId) || { staffName, tabsOpened: 0, earningsPaise: 0 };
      sExisting.tabsOpened++;
      if (tab.status === 'settled') {
        for (const p of tab.payments) {
          sExisting.earningsPaise += Math.round(Number(p.amount) * 100);
        }
      }
      staffSales.set(staffId, sExisting);
    }

    const topSellingItems = Array.from(itemCounts.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    const staffBreakdown = Array.from(staffSales.values());

    return {
      date: dayStart.toISOString().split('T')[0],
      totalEarningsPaise,
      settledTabsCount,
      openTabsCount,
      totalTabs: tabs.length,
      topSellingItems,
      staffBreakdown,
    };
  }

  /**
   * RP-06: Staff Report
   */
  async getStaffReport(query: StaffReportQuery) {
    const { fromDate, toDate } = this.parseDateRange(query.from, query.to);

    const staffMembers = await prisma.staff.findMany({
      where: { isActive: true },
      include: {
        shifts: {
          where: {
            shiftDate: { gte: fromDate, lte: toDate },
          },
        },
        leaveRequests: {
          where: {
            status: 'approved',
            fromDate: { lte: toDate },
            toDate: { gte: fromDate },
          },
        },
      },
    });

    return staffMembers.map((staff) => {
      let totalHoursWorked = 0;
      let completedShifts = 0;

      for (const shift of staff.shifts) {
        if (shift.shiftStart && shift.shiftEnd) {
          const hours =
            (new Date(shift.shiftEnd).getTime() - new Date(shift.shiftStart).getTime()) /
            (1000 * 60 * 60);
          totalHoursWorked += Math.max(0, hours);
          completedShifts++;
        }
      }

      let leaveDaysTaken = 0;
      for (const l of staff.leaveRequests) {
        const start = new Date(l.fromDate).getTime();
        const end = new Date(l.toDate).getTime();
        const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
        leaveDaysTaken += days;
      }

      const standardAnnualLeaveDays = 24;
      const leaveBalanceDays = Math.max(0, standardAnnualLeaveDays - leaveDaysTaken);

      return {
        staffId: staff.id,
        name: `${staff.firstName} ${staff.lastName}`.trim(),
        email: staff.email,
        role: staff.role,
        completedShifts,
        totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
        leaveDaysTaken,
        leaveBalanceDays,
      };
    });
  }
}

export const reportsService = new ReportsService();
