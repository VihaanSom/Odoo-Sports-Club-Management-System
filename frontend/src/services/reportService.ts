import { apiClient } from './apiClient';
import {
  mockRevenueSummary,
  mockCourtHeatmapData,
  mockMemberGrowthData,
  mockBarAnalyticsSummary,
  mockClubSummaryKPIs,
} from '@/mock/reports';
import type {
  RevenueSummary,
  CourtHeatmapPoint,
  MemberGrowthPoint,
  BarAnalyticsSummary,
  StaffUtilizationSummary,
  ClubSummaryKPIs,
} from '@/types/reports';

export const reportService = {
  // RP-01: Revenue report (breakdown by memberships, bookings, bar, equipment)
  getRevenueSummary: async (period?: string): Promise<RevenueSummary> => {
    try {
      const response = await apiClient.get<RevenueSummary>('/reports/revenue', {
        params: { period },
      });
      return response.data;
    } catch {
      return mockRevenueSummary;
    }
  },

  // RP-02: Court / Facility Occupancy Heatmap
  getCourtHeatmap: async (facility?: string): Promise<CourtHeatmapPoint[]> => {
    try {
      const response = await apiClient.get<CourtHeatmapPoint[]>('/reports/court-heatmap', {
        params: { facility },
      });
      return response.data;
    } catch {
      return mockCourtHeatmapData;
    }
  },

  // RP-03: Member retention / churn analytics
  getMemberGrowth: async (): Promise<MemberGrowthPoint[]> => {
    try {
      const response = await apiClient.get<MemberGrowthPoint[]>('/reports/member-growth');
      return response.data;
    } catch {
      return mockMemberGrowthData;
    }
  },

  // RP-04: Bar & POS analytics
  getBarAnalytics: async (): Promise<BarAnalyticsSummary> => {
    try {
      const response = await apiClient.get<BarAnalyticsSummary>('/reports/bar-analytics');
      return response.data;
    } catch {
      return mockBarAnalyticsSummary;
    }
  },

  // RP-05: Staff utilization & shifts summary
  getStaffUtilization: async (): Promise<StaffUtilizationSummary> => {
    try {
      const response = await apiClient.get<StaffUtilizationSummary>('/reports/staff-utilization');
      return response.data;
    } catch {
      return {
        totalShiftsScheduled: 42,
        completedShifts: 38,
        hoursLogged: 310,
        activeStaffCount: 8,
        onLeaveStaffCount: 1,
      };
    }
  },

  // RP-06: Comprehensive club summary KPIs
  getClubSummaryKPIs: async (): Promise<ClubSummaryKPIs> => {
    try {
      const response = await apiClient.get<ClubSummaryKPIs>('/reports/kpis');
      return response.data;
    } catch {
      return mockClubSummaryKPIs;
    }
  },
};

export default reportService;
