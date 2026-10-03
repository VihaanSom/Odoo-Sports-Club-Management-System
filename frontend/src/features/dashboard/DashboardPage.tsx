import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  FaTrophy,
  FaCalendarPlus,
  FaUserPlus,
  FaSun,
  FaMoon,
  FaRotate,
  FaFileInvoiceDollar,
  FaBullhorn,
  FaTriangleExclamation,
  FaDumbbell,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { useThemeStore } from '@/stores/themeStore';
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
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'black';

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
    } catch {
      toast.error('Could not refresh dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6 pb-8"
    >
      {/* Header section with brand logo and prominent theme toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shrink-0 mt-0.5">
            <FaTrophy className="size-6 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Champions Club Command Center
              </h1>
              <span className="badge badge-success badge-sm font-bold gap-1">
                <span className="size-2 rounded-full bg-success animate-ping" />
                Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
              Real-time court occupancy, membership growth, bookings ledger, and clubhouse operations.
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

          {/* Prominent Dashboard Theme Toggle (Corporate Light / Black Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-outline btn-sm gap-2"
            aria-label="Toggle light and dark mode"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <>
                <FaSun className="size-3.5 text-warning" />
                <span className="text-xs font-semibold">Light</span>
              </>
            ) : (
              <>
                <FaMoon className="size-3.5 text-primary" />
                <span className="text-xs font-semibold">Dark</span>
              </>
            )}
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

      {/* Live Facilities Grid & Bar Earnings Snapshot */}
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

      {/* Active Operations Hub: Recent Bookings & Dynamic Operations Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBookingsTable />
        </div>

        {/* Tabbed Operations Watchlist: Renewals / Leads / Low Stock / Equipment */}
        <div className="flex flex-col gap-3">
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
