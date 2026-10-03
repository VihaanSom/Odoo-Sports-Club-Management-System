import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  FaCalendarPlus,
  FaUserPlus,
  FaRotate,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { reportService } from '@/services/reportService';
import type {
  ClubSummaryKPIs,
  RevenueSummary,
  CourtHeatmapPoint,
  MemberGrowthPoint,
  BarAnalyticsSummary,
} from '@/types/reports';
import { useAuthStore } from '@/stores/authStore';
import { isMemberRole } from '@/lib/permissions';
import {
  KpiStatsGrid,
  FacilityOccupancyGrid,
  RecentBookingsTable,
  RevenueChart,
  MemberGrowthChart,
  CourtUtilizationChart,
  BarEarningsSummary,
  UpcomingRenewals,
  RecentLeadsWidget,
  LowStockAlerts,
  EquipmentStatusCard,
  MemberDashboardView,
} from './components';

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const isMember = isMemberRole(user?.role);

  const [kpis, setKpis] = useState<ClubSummaryKPIs | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [heatmap, setHeatmap] = useState<CourtHeatmapPoint[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowthPoint[]>([]);
  const [barAnalytics, setBarAnalytics] = useState<BarAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tab state for Analytics Hub (Revenue / Utilization / Member Growth / Bistro)
  const [analyticsTab, setAnalyticsTab] = useState<'revenue' | 'utilization' | 'members' | 'bar'>('revenue');

  // Tab state for Operations Watchlist (Renewals / Leads / Alerts / Equipment)
  const [activeOpsTab, setActiveOpsTab] = useState<'renewals' | 'leads' | 'stock' | 'equipment'>('renewals');

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      const [kpiRes, revRes, heatRes, growthRes, barRes] = await Promise.all([
        reportService.getClubSummaryKPIs(),
        reportService.getRevenueSummary(),
        reportService.getCourtHeatmap(),
        reportService.getMemberGrowth(),
        reportService.getBarAnalytics(),
      ]);

      setKpis(kpiRes);
      setRevenue(revRes);
      setHeatmap(heatRes);
      setMemberGrowth(growthRes);
      setBarAnalytics(barRes);

      if (showToast) {
        toast.success('Dashboard metrics updated');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard intelligence data:', error);
      if (showToast) {
        toast.error('Unable to refresh metrics');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isMember) {
      fetchDashboardData(false);
    }
  }, [fetchDashboardData, isMember]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  if (isMember) {
    return <MemberDashboardView />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">
            Dashboard
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Overview of club operations, revenue, and court reservations
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-ghost btn-sm gap-1.5"
            title="Refresh metrics"
          >
            <FaRotate className={`size-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link to="/bookings/new" className="btn btn-primary btn-sm gap-1.5 font-medium shadow-xs">
            <FaCalendarPlus className="size-3.5" />
            <span>Book Court</span>
          </Link>

          <Link to="/members" className="btn btn-outline btn-sm gap-1.5 font-medium">
            <FaUserPlus className="size-3.5" />
            <span>New Member</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics (4 Clean Cards) */}
      <KpiStatsGrid kpis={kpis} loading={loading} />

      {/* Main Content Layout (2 Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Primary Left Column: Analytics + Recent Bookings */}
        <div className="xl:col-span-2 space-y-6">
          {/* Performance & Analytics Section with Clean Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Performance & Analytics
              </span>
              <div className="tabs tabs-box bg-base-200/80 p-0.5 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAnalyticsTab('revenue')}
                  className={`tab tab-xs sm:tab-sm transition-all rounded-lg ${
                    analyticsTab === 'revenue'
                      ? 'tab-active bg-base-100 text-base-content shadow-xs font-semibold'
                      : 'text-base-content/70'
                  }`}
                >
                  Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsTab('utilization')}
                  className={`tab tab-xs sm:tab-sm transition-all rounded-lg ${
                    analyticsTab === 'utilization'
                      ? 'tab-active bg-base-100 text-base-content shadow-xs font-semibold'
                      : 'text-base-content/70'
                  }`}
                >
                  Court Heatmap
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsTab('members')}
                  className={`tab tab-xs sm:tab-sm transition-all rounded-lg ${
                    analyticsTab === 'members'
                      ? 'tab-active bg-base-100 text-base-content shadow-xs font-semibold'
                      : 'text-base-content/70'
                  }`}
                >
                  Member Growth
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsTab('bar')}
                  className={`tab tab-xs sm:tab-sm transition-all rounded-lg ${
                    analyticsTab === 'bar'
                      ? 'tab-active bg-base-100 text-base-content shadow-xs font-semibold'
                      : 'text-base-content/70'
                  }`}
                >
                  Bar & Bistro
                </button>
              </div>
            </div>

            <div>
              {analyticsTab === 'revenue' && <RevenueChart data={revenue} loading={loading} />}
              {analyticsTab === 'utilization' && <CourtUtilizationChart data={heatmap} loading={loading} />}
              {analyticsTab === 'members' && <MemberGrowthChart data={memberGrowth} loading={loading} />}
              {analyticsTab === 'bar' && <BarEarningsSummary data={barAnalytics} />}
            </div>
          </div>

          {/* Facility Occupancy Grid */}
          <FacilityOccupancyGrid />

          {/* Recent Reservations Table */}
          <RecentBookingsTable />
        </div>

        {/* Sidebar Right Column: Club Status + Operations Watchlist */}
        <div className="xl:col-span-1 space-y-6">
          {/* Club Status Card */}
          <div className="card bg-base-100 border border-base-200/80 p-5 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-base-content/60">Club Status</span>
                <p className="text-xs text-base-content/50 mt-0.5">Operating Hours: 06:00 - 23:00</p>
              </div>
              <span className="badge badge-sm badge-success font-semibold">Open</span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-base-content/70 mb-1.5">
                <span>Current Court Capacity</span>
                <span className="font-bold text-base-content">78%</span>
              </div>
              <progress className="progress progress-primary w-full h-2" value={78} max={100} />
            </div>
          </div>

          {/* Operations Watchlist (Tabbed) */}
          <div className="space-y-3">
            <div className="tabs tabs-box bg-base-200/80 p-0.5 rounded-xl w-full grid grid-cols-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveOpsTab('renewals')}
                className={`tab tab-xs rounded-lg transition-all ${
                  activeOpsTab === 'renewals'
                    ? 'tab-active bg-base-100 text-base-content font-semibold shadow-xs'
                    : 'text-base-content/70'
                }`}
                title="Expiring Memberships"
              >
                Renewals
              </button>
              <button
                type="button"
                onClick={() => setActiveOpsTab('leads')}
                className={`tab tab-xs rounded-lg transition-all ${
                  activeOpsTab === 'leads'
                    ? 'tab-active bg-base-100 text-base-content font-semibold shadow-xs'
                    : 'text-base-content/70'
                }`}
                title="Recent Inbound Leads"
              >
                Leads
              </button>
              <button
                type="button"
                onClick={() => setActiveOpsTab('stock')}
                className={`tab tab-xs rounded-lg transition-all ${
                  activeOpsTab === 'stock'
                    ? 'tab-active bg-base-100 text-base-content font-semibold shadow-xs'
                    : 'text-base-content/70'
                }`}
                title="Low Stock Alerts"
              >
                Stock
              </button>
              <button
                type="button"
                onClick={() => setActiveOpsTab('equipment')}
                className={`tab tab-xs rounded-lg transition-all ${
                  activeOpsTab === 'equipment'
                    ? 'tab-active bg-base-100 text-base-content font-semibold shadow-xs'
                    : 'text-base-content/70'
                }`}
                title="Pro Shop Inventory"
              >
                Shop
              </button>
            </div>

            <div>
              {activeOpsTab === 'renewals' && <UpcomingRenewals />}
              {activeOpsTab === 'leads' && <RecentLeadsWidget />}
              {activeOpsTab === 'stock' && <LowStockAlerts />}
              {activeOpsTab === 'equipment' && <EquipmentStatusCard />}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
