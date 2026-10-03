import {
  Prisma,
  TabStatus,
  MembershipTier,
  PaymentMethod,
} from '@prisma/client';
import { prisma } from '../../../config/prisma';
import {
  NotFoundError,
  ConflictError,
  UnprocessableError,
  ForbiddenError,
} from '../../../utils/errors';
import { AuthUser } from '../../../types';
import { broadcast } from '../../../ws';
import {
  ListTabsQuery,
  OpenTabInput,
  AddTabItemsInput,
  SettleTabInput,
} from './tabs.validator';

export interface TabItemResponse {
  id: number;
  menuItemId: number;
  menuItemName: string;
  qty: number;
  unitPricePaise: number;
  subtotalPaise: number;
}

export interface TabDetailResponse {
  id: number;
  barTableId: number;
  tableNo: string;
  memberId: number | null;
  memberName: string | null;
  memberTier: MembershipTier | null;
  openedBy: number;
  openedByName: string;
  status: TabStatus;
  openedAt: string;
  settledAt: string | null;
  notes: string | null;
  items: TabItemResponse[];
  runningTotalPaise: number;
}

export interface SettledTabResponse {
  id: number;
  tableNo: string;
  status: TabStatus;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  memberName: string | null;
  memberTier: MembershipTier | null;
  paymentMethod: PaymentMethod;
  settledAt: string;
  items: {
    menuItemName: string;
    qty: number;
    unitPricePaise: number;
    subtotalPaise: number;
  }[];
  payment: {
    id: number;
    amountPaise: number;
    paymentMethod: PaymentMethod;
    paidAt: string;
  };
}

export function formatTabDetail(tab: any): TabDetailResponse {
  const items: TabItemResponse[] = (tab.items || []).map((it: any) => ({
    id: it.id,
    menuItemId: it.menuItemId,
    menuItemName: it.menuItem?.name || `Item #${it.menuItemId}`,
    qty: it.qty,
    unitPricePaise: Math.round(Number(it.unitPrice) * 100),
    subtotalPaise: Math.round(Number(it.subtotal) * 100),
  }));

  const runningTotalPaise = items.reduce((acc, it) => acc + it.subtotalPaise, 0);

  return {
    id: tab.id,
    barTableId: tab.barTableId,
    tableNo: tab.table?.tableNo || `T${tab.barTableId}`,
    memberId: tab.memberId,
    memberName: tab.member ? `${tab.member.firstName} ${tab.member.lastName}`.trim() : null,
    memberTier: tab.member?.tier || null,
    openedBy: tab.openedBy,
    openedByName: tab.staff ? `${tab.staff.firstName} ${tab.staff.lastName}`.trim() : `Staff #${tab.openedBy}`,
    status: tab.status,
    openedAt: tab.openedAt.toISOString(),
    settledAt: tab.settledAt ? tab.settledAt.toISOString() : null,
    notes: tab.notes || null,
    items,
    runningTotalPaise,
  };
}

export class BarTabsService {
  /**
   * TB-01: List open tabs with optional status, table, or date filters.
   */
  async listTabs(query: ListTabsQuery): Promise<TabDetailResponse[]> {
    const where: Prisma.BarTabWhereInput = {};

    if (query.status) {
      where.status = query.status as TabStatus;
    }

    if (query.barTableId) {
      where.barTableId = query.barTableId;
    }

    if (query.date) {
      const startDate = new Date(`${query.date}T00:00:00.000Z`);
      const endDate = new Date(`${query.date}T23:59:59.999Z`);
      where.openedAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const tabs = await prisma.barTab.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      include: {
        table: true,
        member: true,
        staff: true,
        items: {
          include: { menuItem: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    return tabs.map(formatTabDetail);
  }

  /**
   * TB-02: Open new tab on a table.
   * Single open tab constraint: A table can have at most ONE open tab at a time.
   */
  async openTab(input: OpenTabInput, staffUserId: number): Promise<TabDetailResponse> {
    // 1. Verify table exists and is active
    const table = await prisma.barTable.findUnique({
      where: { id: input.barTableId },
    });
    if (!table || !table.isActive) {
      throw new NotFoundError('TABLE_NOT_FOUND', `Bar table with ID ${input.barTableId} not found or is inactive.`);
    }

    // 2. If memberId is provided, verify member exists
    if (input.memberId) {
      const member = await prisma.member.findUnique({
        where: { id: input.memberId },
      });
      if (!member) {
        throw new NotFoundError('MEMBER_NOT_FOUND', `Member with ID ${input.memberId} not found.`);
      }
    }

    // 3. Verify no open tab currently exists on this table
    const existingOpenTab = await prisma.barTab.findFirst({
      where: {
        barTableId: input.barTableId,
        status: TabStatus.open,
      },
    });
    if (existingOpenTab) {
      throw new ConflictError('TAB_ALREADY_OPEN', 'Table already has an open tab');
    }

    // 4. Create new tab
    const created = await prisma.barTab.create({
      data: {
        barTableId: input.barTableId,
        memberId: input.memberId ?? null,
        openedBy: staffUserId,
        status: TabStatus.open,
        notes: input.notes ?? null,
      },
      include: {
        table: true,
        member: true,
        staff: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    return formatTabDetail(created);
  }

  /**
   * TB-03: Get tab detail by ID with itemised list.
   * Members can view their own tabs only.
   */
  async getTabById(id: number, user: AuthUser): Promise<TabDetailResponse> {
    const tab = await prisma.barTab.findUnique({
      where: { id },
      include: {
        table: true,
        member: true,
        staff: true,
        items: {
          include: { menuItem: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!tab) {
      throw new NotFoundError('TAB_NOT_FOUND', `Bar tab with ID ${id} not found.`);
    }

    // Authorization: member can only view their own tabs
    if (user.role === 'member') {
      const userId = user.sub ?? user.id;
      if (tab.memberId !== userId) {
        throw new ForbiddenError('FORBIDDEN', 'Access denied. You can only view your own tabs.');
      }
    }

    return formatTabDetail(tab);
  }

  /**
   * TB-04: Add items from menu_items to an open tab.
   * ACID transaction: Atomically verifies and deducts stock, then broadcasts to WebSocket bar:orders.
   */
  async addItemsToTab(tabId: number, input: AddTabItemsInput): Promise<TabDetailResponse> {
    const updatedTab = await prisma.$transaction(async (tx) => {
      // 1. Fetch tab
      const tab = await tx.barTab.findUnique({
        where: { id: tabId },
        include: { table: true },
      });

      if (!tab) {
        throw new NotFoundError('TAB_NOT_FOUND', `Bar tab with ID ${tabId} not found.`);
      }

      if (tab.status !== TabStatus.open) {
        throw new UnprocessableError('TAB_ALREADY_SETTLED', 'Tab is not open');
      }

      // 2. Fetch menu items and check availability and stock
      const menuItemIds = input.items.map((i) => i.menuItemId);
      const menuItems = await tx.menuItem.findMany({
        where: { id: { in: menuItemIds } },
      });

      const menuMap = new Map(menuItems.map((m) => [m.id, m]));
      const insufficientItems: any[] = [];
      const newItemsToCreate: {
        tabId: number;
        menuItemId: number;
        qty: number;
        unitPrice: Prisma.Decimal;
        subtotal: Prisma.Decimal;
      }[] = [];

      for (const reqItem of input.items) {
        const item = menuMap.get(reqItem.menuItemId);
        if (!item || !item.isAvailable || item.stockQty < reqItem.qty) {
          insufficientItems.push({
            menuItemId: reqItem.menuItemId,
            requested: reqItem.qty,
            available: item && item.isAvailable ? item.stockQty : 0,
          });
        } else {
          const unitPrice = item.price;
          const lineSubtotal = unitPrice.mul(reqItem.qty);
          newItemsToCreate.push({
            tabId,
            menuItemId: item.id,
            qty: reqItem.qty,
            unitPrice,
            subtotal: lineSubtotal,
          });
        }
      }

      if (insufficientItems.length > 0) {
        throw new ConflictError(
          'INSUFFICIENT_STOCK',
          'One or more menu items have insufficient stock.',
          { items: insufficientItems }
        );
      }

      // 3. Insert bar tab items
      for (const it of newItemsToCreate) {
        await tx.barTabItem.create({
          data: it,
        });

        // 4. Atomically deduct stock from menu item
        await tx.menuItem.update({
          where: { id: it.menuItemId },
          data: {
            stockQty: { decrement: it.qty },
          },
        });
      }

      // 5. Return updated tab with full relations
      return tx.barTab.findUniqueOrThrow({
        where: { id: tabId },
        include: {
          table: true,
          member: true,
          staff: true,
          items: {
            include: { menuItem: true },
            orderBy: { id: 'asc' },
          },
        },
      });
    });

    // 6. Broadcast to WebSocket channel 'bar:orders'
    const newItemsSummary = input.items.map((it) => {
      const found = updatedTab.items.find((i) => i.menuItemId === it.menuItemId);
      return {
        menuItemName: found?.menuItem?.name || `Item #${it.menuItemId}`,
        qty: it.qty,
      };
    });

    try {
      broadcast('bar:orders', {
        event: 'tab:items_added',
        data: {
          tabId: updatedTab.id,
          tableNo: updatedTab.table.tableNo,
          newItems: newItemsSummary,
        },
      });
    } catch (wsErr) {
      console.error('Error broadcasting bar order via WebSocket:', wsErr);
    }

    return formatTabDetail(updatedTab);
  }

  /**
   * TB-05: Settle (close) an open tab.
   * Computes member discount, creates payment record, marks tab settled.
   */
  async settleTab(tabId: number, input: SettleTabInput): Promise<SettledTabResponse> {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch tab with items, member, table
      const tab = await tx.barTab.findUnique({
        where: { id: tabId },
        include: {
          table: true,
          member: true,
          items: {
            include: { menuItem: true },
          },
        },
      });

      if (!tab) {
        throw new NotFoundError('TAB_NOT_FOUND', `Bar tab with ID ${tabId} not found.`);
      }

      if (tab.status !== TabStatus.open) {
        throw new UnprocessableError('TAB_ALREADY_SETTLED', 'Tab is not open');
      }

      // 2. Compute subtotal from all bar tab items
      let subtotalPaise = 0;
      const formattedItems = tab.items.map((it) => {
        const unitPricePaise = Math.round(Number(it.unitPrice) * 100);
        const lineSubtotalPaise = Math.round(Number(it.subtotal) * 100);
        subtotalPaise += lineSubtotalPaise;
        return {
          menuItemName: it.menuItem.name,
          qty: it.qty,
          unitPricePaise,
          subtotalPaise: lineSubtotalPaise,
        };
      });

      // 3. Compute member tier discount: Gold: 15%, Silver: 10%, Junior: 5%, non-member: 0%
      let discountPct = 0;
      if (tab.member) {
        if (tab.member.tier === MembershipTier.Gold) discountPct = 0.15;
        else if (tab.member.tier === MembershipTier.Silver) discountPct = 0.10;
        else if (tab.member.tier === MembershipTier.Junior) discountPct = 0.05;
      }

      const discountPaise = Math.round(subtotalPaise * discountPct);
      const totalPaise = subtotalPaise - discountPaise;
      const settledAt = new Date();

      // 4. Update bar tab to settled
      await tx.barTab.update({
        where: { id: tabId },
        data: {
          status: TabStatus.settled,
          settledAt,
        },
      });

      // 5. Create payment record
      const payment = await tx.payment.create({
        data: {
          memberId: tab.memberId,
          barTabId: tab.id,
          amount: new Prisma.Decimal(totalPaise / 100),
          paymentMethod: input.paymentMethod,
          referenceNo: input.referenceNo ?? null,
          paidAt: settledAt,
        },
      });

      return {
        id: tab.id,
        tableNo: tab.table.tableNo,
        status: TabStatus.settled,
        subtotalPaise,
        discountPaise,
        totalPaise,
        memberName: tab.member ? `${tab.member.firstName} ${tab.member.lastName}`.trim() : null,
        memberTier: tab.member ? tab.member.tier : null,
        paymentMethod: input.paymentMethod,
        settledAt: settledAt.toISOString(),
        items: formattedItems,
        payment: {
          id: payment.id,
          amountPaise: totalPaise,
          paymentMethod: payment.paymentMethod,
          paidAt: payment.paidAt.toISOString(),
        },
      };
    });

    return result;
  }
}

export const barTabsService = new BarTabsService();
