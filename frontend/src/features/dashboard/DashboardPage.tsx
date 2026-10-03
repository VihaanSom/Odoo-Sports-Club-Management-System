import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  FaTrophy,
  FaCalendarPlus,
  FaUserPlus,
  FaRotate,
  FaFileInvoiceDollar,
  FaBullhorn,
  FaTriangleExclamation,
  FaDumbbell,
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
import {
  KpiStatsGrid,
  QuickActions,
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
} from './components';

export const DashboardPage = () => {
  const [kpis, setKpis] = useState<ClubSummaryKPIs | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [heatmap, setHeatmap] = useState<CourtHeatmapPoint[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowthPoint[]>([]);
  const [barAnalytics, setBarAnalytics] = useState<BarAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tab state for the Operations Sidecard (Renewals / Leads / Alerts / Equipment)
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
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header section with brand logo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shrink-0 mt-0.5">
            <FaTrophy className="size-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Champions Club Command Center
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
              Court occupancy, membership growth, bookings ledger, and clubhouse operations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline btn-sm gap-1.5"
            title="Refresh telemetry"
          >
            <FaRotate className={`size-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link to="/bookings/new" className="btn btn-primary btn-sm gap-1.5 shadow-xs font-semibold">
            <FaCalendarPlus className="size-3.5" />
            <span>Book Court</span>
          </Link>

          <Link to="/members" className="btn btn-outline btn-sm gap-1.5 font-semibold">
            <FaUserPlus className="size-3.5" />
            <span>New Member</span>
          </Link>
        </div>
      </div>

      {/* Quick Launch Actions Ribbon */}
      <QuickActions />

      {/* KPI Stats Grid with real service data */}
      <KpiStatsGrid kpis={kpis} loading={loading} />

      {/* Facilities Grid & Bar Earnings Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FacilityOccupancyGrid />
        </div>
        <div>
          <BarEarningsSummary data={barAnalytics} />
        </div>
      </div>

      {/* Financial & Membership Velocity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenue} loading={loading} />
        <MemberGrowthChart data={memberGrowth} loading={loading} />
      </div>

      {/* Court Utilization Heatmap */}
      <CourtUtilizationChart data={heatmap} loading={loading} />

      {/* Active Operations Hub: Recent Bookings & Operations Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBookingsTable />
        </div>

        {/* Tabbed Operations Watchlist + Club Status Card */}
        <div className="flex flex-col gap-4">
          {/* Club Status Card (Moved from Sidebar) */}
          <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">Club Status</span>
                <p className="text-xs text-base-content/70 mt-0.5">Operating Hours: 06:00 - 23:00</p>
              </div>
              <span className="badge badge-sm badge-success font-semibold">Open</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-base-content/70 mb-1">
                <span>Court Capacity</span>
                <span className="font-bold text-base-content">78%</span>
              </div>
              <progress className="progress progress-primary w-full h-2" value={78} max={100} />
            </div>
          </div>

          {/* Operations Watchlist Tabs */}
          <div className="tabs tabs-box bg-base-300/60 p-1 rounded-xl self-start w-full grid grid-cols-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveOpsTab('renewals')}
              className={`tab tab-xs sm:tab-sm gap-1 transition-all ${
                activeOpsTab === 'renewals'
                  ? 'tab-active bg-primary text-primary-content shadow-xs'
                  : ''
              }`}
              title="Expiring Memberships"
            >
              <FaFileInvoiceDollar className="size-3" />
              <span className="hidden sm:inline">Renewals</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveOpsTab('leads')}
              className={`tab tab-xs sm:tab-sm gap-1 transition-all ${
                activeOpsTab === 'leads'
                  ? 'tab-active bg-primary text-primary-content shadow-xs'
                  : ''
              }`}
              title="Recent Inbound Leads"
            >
              <FaBullhorn className="size-3" />
              <span className="hidden sm:inline">Leads</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveOpsTab('stock')}
              className={`tab tab-xs sm:tab-sm gap-1 transition-all ${
                activeOpsTab === 'stock'
                  ? 'tab-active bg-primary text-primary-content shadow-xs'
                  : ''
              }`}
              title="Low Stock Inventory Alerts"
            >
              <FaTriangleExclamation className="size-3" />
              <span className="hidden sm:inline">Alerts</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveOpsTab('equipment')}
              className={`tab tab-xs sm:tab-sm gap-1 transition-all ${
                activeOpsTab === 'equipment'
                  ? 'tab-active bg-primary text-primary-content shadow-xs'
                  : ''
              }`}
              title="Pro Shop Inventory"
            >
              <FaDumbbell className="size-3" />
              <span className="hidden sm:inline">Shop</span>
            </button>
          </div>

          <div className="flex-1">
            {activeOpsTab === 'renewals' && <UpcomingRenewals />}
            {activeOpsTab === 'leads' && <RecentLeadsWidget />}
            {activeOpsTab === 'stock' && <LowStockAlerts />}
            {activeOpsTab === 'equipment' && <EquipmentStatusCard />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
