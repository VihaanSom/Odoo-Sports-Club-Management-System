import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FaChartLine,
  FaUsers,
  FaWineGlass,
  FaReceipt,
  FaCircleCheck,
  FaFilePdf,
  FaEye,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { usePagination } from '@/hooks';
import { reportService } from '@/services/reportService';
import { formatPaise } from '@/lib/utils';
import { RevenueLineChart } from './components/RevenueLineChart';
import { MemberGrowthLine } from './components/MemberGrowthLine';
import { ReportPreviewModal } from './components/ReportPreviewModal';
import { generateExecutiveReportPdf } from './utils/generateExecutiveReportPdf';
import type {
  RevenueSummary,
  MemberGrowthPoint,
  BarAnalyticsSummary,
  ClubSummaryKPIs,
  OverallEarningsResponse,
} from '@/types/reports';

export const ReportsHubPage = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'members' | 'bar'>('revenue');
  const [kpis, setKpis] = useState<ClubSummaryKPIs | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [earnings, setEarnings] = useState<OverallEarningsResponse | null>(null);
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowthPoint[]>([]);
  const [barAnalytics, setBarAnalytics] = useState<BarAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const topSellersList = barAnalytics?.topSellers || [];
  const {
    page: topSellersPage,
    totalPages: topSellersTotalPages,
    startIndex: topSellersStartIndex,
    endIndex: topSellersEndIndex,
    paginateItems: paginateTopSellers,
    setPage: setTopSellersPage,
  } = usePagination({ totalItems: topSellersList.length, pageSize: 10 });
  const paginatedTopSellers = paginateTopSellers(topSellersList);

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true);
      try {
        const [kpiRes, revRes, growthRes, barRes, earnRes] = await Promise.all([
          reportService.getClubSummaryKPIs(),
          reportService.getRevenueSummary(),
          reportService.getMemberGrowth(),
          reportService.getBarAnalytics(),
          reportService.getEarnings(),
        ]);
        setKpis(kpiRes);
        setRevenue(revRes);
        setMemberGrowth(growthRes);
        setBarAnalytics(barRes);
        setEarnings(earnRes);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    const toastId = toast.loading('Generating executive vector PDF...', { id: 'pdf-toast' });

    try {
      const pdf = generateExecutiveReportPdf({
        kpis,
        revenue,
        earnings,
        barAnalytics,
      });

      pdf.save(`champions-club-executive-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Executive 1-Page PDF downloaded successfully', { id: toastId });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-base-content/60">
        <span className="loading loading-spinner loading-lg mr-2" />
        Loading club analytics & intelligence...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaChartLine className="size-7 text-primary" /> Club Analytics & Reports
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Real-time financial intelligence, member retention, and bar POS metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="btn btn-outline btn-sm gap-2 font-semibold shadow-xs"
          >
            <FaEye className="size-4" />
            <span>Preview Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="btn btn-primary btn-sm gap-2 font-semibold shadow-xs"
          >
            <FaFilePdf className="size-4 text-primary-content" />
            <span>{downloadingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      <div id="reports-hub-content" className="space-y-6">
        {/* Earnings Widgets: Today, This Week, This Month */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-100 border border-base-300 p-4 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Earnings Today
              </span>
              <span className="badge badge-xs badge-success">Today</span>
            </div>
            <div className="text-2xl font-black text-success mt-2 font-mono">
              {formatPaise(earnings?.today.totalPaise ?? 0)}
            </div>
            <div className="text-[11px] text-base-content/50 mt-1 flex items-center gap-2">
              <span>Courts: {formatPaise(earnings?.today.courtsPaise ?? 0)}</span>
              <span>·</span>
              <span>Bar: {formatPaise(earnings?.today.barPaise ?? 0)}</span>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-4 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Earnings This Week
              </span>
              <span className="badge badge-xs badge-primary">This Week</span>
            </div>
            <div className="text-2xl font-black text-primary mt-2 font-mono">
              {formatPaise(earnings?.thisWeek.totalPaise ?? 0)}
            </div>
            <div className="text-[11px] text-base-content/50 mt-1 flex items-center gap-2">
              <span>Courts: {formatPaise(earnings?.thisWeek.courtsPaise ?? 0)}</span>
              <span>·</span>
              <span>Bar: {formatPaise(earnings?.thisWeek.barPaise ?? 0)}</span>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-4 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Earnings This Month
              </span>
              <span className="badge badge-xs badge-secondary">This Month</span>
            </div>
            <div className="text-2xl font-black text-secondary mt-2 font-mono">
              {formatPaise(earnings?.thisMonth.totalPaise ?? 0)}
            </div>
            <div className="text-[11px] text-base-content/50 mt-1 flex items-center gap-2">
              <span>Courts: {formatPaise(earnings?.thisMonth.courtsPaise ?? 0)}</span>
              <span>·</span>
              <span>Subs: {formatPaise(earnings?.thisMonth.membershipsPaise ?? 0)}</span>
            </div>
          </div>
        </div>

      {/* Top Level KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="card bg-base-100 border border-base-300 p-3 shadow-xs">
            <div className="text-[11px] text-base-content/60 uppercase font-semibold">Total Revenue</div>
            <div className="text-xl font-black text-primary mt-1 font-mono">
              ₹{(kpis.totalRevenuePaise / 10000000).toFixed(2)} Cr
            </div>
            <div className="text-[10px] text-success mt-0.5">₹{(kpis.totalRevenuePaise / 100).toLocaleString('en-IN')}</div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-3 shadow-xs">
            <div className="text-[11px] text-base-content/60 uppercase font-semibold">Active Members</div>
            <div className="text-xl font-black mt-1 font-mono">{kpis.activeMembersCount}</div>
            <div className="text-[10px] text-success mt-0.5">99.4% retention</div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-3 shadow-xs">
            <div className="text-[11px] text-base-content/60 uppercase font-semibold">Today Bookings</div>
            <div className="text-xl font-black mt-1 font-mono">{kpis.todayBookingsCount}</div>
            <div className="text-[10px] text-base-content/60 mt-0.5">Across 12 courts</div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-3 shadow-xs">
            <div className="text-[11px] text-base-content/60 uppercase font-semibold">Court Utilization</div>
            <div className="text-xl font-black text-warning mt-1 font-mono">
              {kpis.courtUtilizationRate}%
            </div>
            <div className="text-[10px] text-base-content/60 mt-0.5">Peak @ 18:00 - 21:00</div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-3 shadow-xs">
            <div className="text-[11px] text-base-content/60 uppercase font-semibold">Bar & POS Rev</div>
            <div className="text-xl font-black text-accent mt-1 font-mono">
              ₹{(kpis.barRevenuePaise / 100000).toFixed(1)}L
            </div>
            <div className="text-[10px] text-base-content/60 mt-0.5">342 tabs logged</div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-3 shadow-xs">
            <div className="text-[11px] text-base-content/60 uppercase font-semibold">Staff Duty / Leave</div>
            <div className="text-xl font-black mt-1 font-mono">
              {kpis.staffOnDutyCount} / {kpis.pendingLeavesCount}
            </div>
            <div className="text-[10px] text-warning mt-0.5">{kpis.pendingLeavesCount} pending approval</div>
          </div>
        </div>
      )}

      {/* Analytics Tabs */}
      <div className="tabs tabs-box bg-base-200/60 p-1 rounded-xl">
        <button
          type="button"
          className={`tab gap-2 text-xs font-semibold ${activeTab === 'revenue' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          <FaReceipt /> Revenue Streams
        </button>
        <button
          type="button"
          className={`tab gap-2 text-xs font-semibold ${activeTab === 'members' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <FaUsers /> Member Growth & Churn
        </button>
        <button
          type="button"
          className={`tab gap-2 text-xs font-semibold ${activeTab === 'bar' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('bar')}
        >
          <FaWineGlass /> Bar & Bistro Analytics
        </button>
      </div>

      {/* Tab 1: Revenue Streams */}
      {activeTab === 'revenue' && revenue && (
        <div className="space-y-6">
          <div className="card bg-base-100 border border-base-300 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-base">Monthly Revenue Breakdown</h3>
                <p className="text-xs text-base-content/60">
                  Performance across memberships, court rentals, bistro POS, and sports gear.
                </p>
              </div>
              <div className="badge badge-success badge-sm font-semibold">
                +{revenue.growthPercentage}% vs prev quarter
              </div>
            </div>

            <RevenueLineChart data={revenue.timeSeries} />
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {revenue.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="card bg-base-100 border border-base-300 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-base-content/70 font-semibold">{cat.category}</span>
                  <span className="badge badge-sm badge-outline font-mono">{cat.percentage}%</span>
                </div>
                <div className="text-xl font-bold font-mono mt-2">
                  ₹{(cat.amountPaise / 100).toLocaleString('en-IN')}
                </div>
                <progress
                  className="progress progress-primary w-full mt-3 h-2"
                  value={cat.percentage}
                  max="100"
                />
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Tab 3: Member Growth & Churn */}
      {activeTab === 'members' && (
        <div className="card bg-base-100 border border-base-300 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base">Member Retention & Acquisition Trend</h3>
            <p className="text-xs text-base-content/60">
              Monthly new member intake vs attrition rates with retention benchmark curve.
            </p>
          </div>
          <MemberGrowthLine data={memberGrowth} />
        </div>
      )}

      {/* Tab 4: Bar & Bistro Analytics */}
      {activeTab === 'bar' && barAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
              <div className="text-xs text-base-content/70 font-semibold uppercase">Total Tabs</div>
              <div className="text-2xl font-black mt-1 font-mono">{barAnalytics.totalTabs}</div>
            </div>
            <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
              <div className="text-xs text-base-content/70 font-semibold uppercase">Open Tabs</div>
              <div className="text-2xl font-black text-warning mt-1 font-mono">
                {barAnalytics.openTabsCount}
              </div>
            </div>
            <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
              <div className="text-xs text-base-content/70 font-semibold uppercase">Average Tab</div>
              <div className="text-2xl font-black text-primary mt-1 font-mono">
                ₹{(barAnalytics.averageTabPaise / 100).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
              <div className="text-xs text-base-content/70 font-semibold uppercase">Bistro Revenue</div>
              <div className="text-2xl font-black text-success mt-1 font-mono">
                ₹{(barAnalytics.totalRevenuePaise / 100).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-base">Top Selling Bistro & Lounge Items</h3>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead className="bg-base-200/60 text-xs">
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th className="text-center">Units Sold</th>
                    <th className="text-right">Total Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTopSellers.map((item) => (
                    <tr key={item.id} className="hover:bg-base-200/40">
                      <td className="font-semibold text-xs flex items-center gap-2">
                        <FaCircleCheck className="text-success text-xs" /> {item.name}
                      </td>
                      <td>
                        <span className="badge badge-outline badge-xs">{item.category}</span>
                      </td>
                      <td className="text-center font-mono font-medium text-xs">{item.unitsSold}</td>
                      <td className="text-right font-mono font-bold text-xs text-primary">
                        ₹{(item.revenuePaise / 100).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {topSellersTotalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-base-300 text-xs">
                <span className="text-base-content/60">
                  Showing {topSellersStartIndex + 1} to {topSellersEndIndex} of {topSellersList.length} items
                </span>
                <div className="join">
                  <button
                    type="button"
                    onClick={() => setTopSellersPage(Math.max(1, topSellersPage - 1))}
                    disabled={topSellersPage <= 1}
                    className="join-item btn btn-xs btn-outline"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    className="join-item btn btn-xs btn-outline no-animation pointer-events-none font-mono"
                  >
                    {topSellersPage} / {topSellersTotalPages}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTopSellersPage(Math.min(topSellersTotalPages, topSellersPage + 1))}
                    disabled={topSellersPage >= topSellersTotalPages}
                    className="join-item btn btn-xs btn-outline"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Preview Modal for Executive Report */}
      <ReportPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onDownload={handleDownloadPdf}
        downloading={downloadingPdf}
        kpis={kpis}
        revenue={revenue}
        earnings={earnings}
        barAnalytics={barAnalytics}
      />
    </motion.div>
  );
};

export default ReportsHubPage;
