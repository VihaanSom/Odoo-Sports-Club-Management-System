export interface RevenueTimeSeriesPoint {
  period: string;
  membershipsPaise: number;
  courtBookingsPaise: number;
  barOrdersPaise: number;
  equipmentPaise: number;
  totalPaise: number;
}

export interface RevenueBreakdownCategory {
  category: string;
  amountPaise: number;
  percentage: number;
}

export interface RevenueSummary {
  totalRevenuePaise: number;
  membershipsPaise: number;
  bookingsPaise: number;
  barPaise: number;
  equipmentPaise: number;
  growthPercentage: number;
  timeSeries: RevenueTimeSeriesPoint[];
  categoryBreakdown: RevenueBreakdownCategory[];
}

export interface CourtHeatmapPoint {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  hour: string; // e.g. "06:00", "07:00", ... "22:00"
  occupancyRate: number; // 0 - 100
  bookingCount: number;
  facility: string;
}

export interface MemberGrowthPoint {
  month: string;
  newMembers: number;
  churnedMembers: number;
  activeMembers: number;
  retentionRate: number;
}

export interface BarAnalyticsItem {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenuePaise: number;
}

export interface BarAnalyticsSummary {
  totalTabs: number;
  openTabsCount: number;
  averageTabPaise: number;
  totalRevenuePaise: number;
  topSellers: BarAnalyticsItem[];
  hourlyActivity: { hour: string; revenuePaise: number; tabCount: number }[];
}

export interface StaffUtilizationSummary {
  totalShiftsScheduled: number;
  completedShifts: number;
  hoursLogged: number;
  activeStaffCount: number;
  onLeaveStaffCount: number;
}

export interface ClubSummaryKPIs {
  totalRevenuePaise: number;
  activeMembersCount: number;
  todayBookingsCount: number;
  courtUtilizationRate: number;
  barRevenuePaise: number;
  staffOnDutyCount: number;
  pendingLeavesCount: number;
}
