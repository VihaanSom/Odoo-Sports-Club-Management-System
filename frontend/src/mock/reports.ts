import type {
  RevenueSummary,
  CourtHeatmapPoint,
  MemberGrowthPoint,
  BarAnalyticsSummary,
  ClubSummaryKPIs,
} from '@/types/reports';

export const mockRevenueSummary: RevenueSummary = {
  totalRevenuePaise: 485000000, // ₹48,50,000 (~48.5 Lakhs)
  membershipsPaise: 315000000, // ₹31,50,000 (65%)
  bookingsPaise: 95000000, // ₹9,50,000 (19.6%)
  barPaise: 55000000, // ₹5,50,000 (11.3%)
  equipmentPaise: 20000000, // ₹2,00,000 (4.1%)
  growthPercentage: 14.8,
  timeSeries: [
    {
      period: 'May 2026',
      membershipsPaise: 42000000,
      courtBookingsPaise: 13000000,
      barOrdersPaise: 7500000,
      equipmentPaise: 2800000,
      totalPaise: 65300000,
    },
    {
      period: 'Jun 2026',
      membershipsPaise: 48000000,
      courtBookingsPaise: 14500000,
      barOrdersPaise: 8200000,
      equipmentPaise: 3100000,
      totalPaise: 73800000,
    },
    {
      period: 'Jul 2026',
      membershipsPaise: 51000000,
      courtBookingsPaise: 15200000,
      barOrdersPaise: 8900000,
      equipmentPaise: 3200000,
      totalPaise: 78300000,
    },
    {
      period: 'Aug 2026',
      membershipsPaise: 54000000,
      courtBookingsPaise: 16800000,
      barOrdersPaise: 9400000,
      equipmentPaise: 3400000,
      totalPaise: 83600000,
    },
    {
      period: 'Sep 2026',
      membershipsPaise: 58000000,
      courtBookingsPaise: 17500000,
      barOrdersPaise: 10200000,
      equipmentPaise: 3600000,
      totalPaise: 89300000,
    },
    {
      period: 'Oct 2026 (MTD)',
      membershipsPaise: 62000000,
      courtBookingsPaise: 18000000,
      barOrdersPaise: 10800000,
      equipmentPaise: 3900000,
      totalPaise: 94700000,
    },
  ],
  categoryBreakdown: [
    { category: 'Memberships', amountPaise: 315000000, percentage: 65.0 },
    { category: 'Court Bookings', amountPaise: 95000000, percentage: 19.6 },
    { category: 'Bar & Bistro', amountPaise: 55000000, percentage: 11.3 },
    { category: 'Equipment & Rentals', amountPaise: 20000000, percentage: 4.1 },
  ],
};

const daysList: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const hoursList = [
  '06:00',
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
];

export const mockCourtHeatmapData: CourtHeatmapPoint[] = daysList.flatMap((day) =>
  hoursList.map((hour) => {
    let rate = 30;
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const isPeakHour = hour === '06:00' || hour === '08:00' || hour === '18:00' || hour === '20:00';

    if (isWeekend) {
      rate = isPeakHour ? 95 : 75;
    } else if (isPeakHour) {
      rate = 85;
    } else if (hour === '12:00' || hour === '14:00') {
      rate = 25;
    } else {
      rate = 55;
    }

    return {
      day,
      hour,
      occupancyRate: rate,
      bookingCount: Math.round((rate / 100) * 12),
      facility: 'All Facilities',
    };
  })
);

export const mockMemberGrowthData: MemberGrowthPoint[] = [
  { month: 'May 2026', newMembers: 38, churnedMembers: 4, activeMembers: 312, retentionRate: 98.7 },
  { month: 'Jun 2026', newMembers: 45, churnedMembers: 6, activeMembers: 351, retentionRate: 98.3 },
  { month: 'Jul 2026', newMembers: 52, churnedMembers: 5, activeMembers: 398, retentionRate: 98.7 },
  { month: 'Aug 2026', newMembers: 49, churnedMembers: 8, activeMembers: 439, retentionRate: 98.2 },
  { month: 'Sep 2026', newMembers: 61, churnedMembers: 7, activeMembers: 493, retentionRate: 98.6 },
  { month: 'Oct 2026', newMembers: 34, churnedMembers: 3, activeMembers: 524, retentionRate: 99.4 },
];

export const mockBarAnalyticsSummary: BarAnalyticsSummary = {
  totalTabs: 342,
  openTabsCount: 8,
  averageTabPaise: 185000, // ₹1,850
  totalRevenuePaise: 63270000, // ₹6,32,700
  topSellers: [
    { id: 'BAR-1', name: 'Electrolyte Whey Shake', category: 'Smoothies', unitsSold: 412, revenuePaise: 12360000 },
    { id: 'BAR-2', name: 'Single Origin Cold Brew', category: 'Coffee', unitsSold: 385, revenuePaise: 9625000 },
    { id: 'BAR-3', name: 'Champions Club Sandwich', category: 'Food', unitsSold: 298, revenuePaise: 11920000 },
    { id: 'BAR-4', name: 'Craft IPA Pint', category: 'Beverage', unitsSold: 275, revenuePaise: 12375000 },
    { id: 'BAR-5', name: 'Avocado Protein Toast', category: 'Food', unitsSold: 230, revenuePaise: 8050000 },
  ],
  hourlyActivity: [
    { hour: '07:00', revenuePaise: 420000, tabCount: 6 },
    { hour: '09:00', revenuePaise: 890000, tabCount: 14 },
    { hour: '12:00', revenuePaise: 1450000, tabCount: 22 },
    { hour: '15:00', revenuePaise: 720000, tabCount: 11 },
    { hour: '18:00', revenuePaise: 3850000, tabCount: 45 },
    { hour: '20:00', revenuePaise: 4900000, tabCount: 58 },
  ],
};

export const mockClubSummaryKPIs: ClubSummaryKPIs = {
  totalRevenuePaise: 485000000,
  activeMembersCount: 524,
  todayBookingsCount: 38,
  courtUtilizationRate: 78.4,
  barRevenuePaise: 55000000,
  staffOnDutyCount: 6,
  pendingLeavesCount: 2,
};
