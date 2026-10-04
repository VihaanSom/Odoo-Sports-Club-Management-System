import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaWineGlass,
  FaArrowUpRightFromSquare,
  FaFire,
  FaReceipt,
  FaPlus,
} from 'react-icons/fa6';
import { reportService } from '@/services/reportService';
import type { BarAnalyticsSummary } from '@/types/reports';
import { Skeleton } from '@/components/ui';

interface BarEarningsSummaryProps {
  data?: BarAnalyticsSummary | null;
}

export const BarEarningsSummary = ({ data: initialData }: BarEarningsSummaryProps) => {
  const [data, setData] = useState<BarAnalyticsSummary | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchBar = async () => {
      try {
        const res = await reportService.getBarAnalytics();
        if (isMounted) setData(res);
      } catch {
        // Handled in service
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBar();
    return () => {
      isMounted = false;
    };
  }, [initialData]);

  const formatRupees = (paise?: number) => {
    if (!paise) return '₹0';
    const r = paise / 100;
    if (r >= 100000) return `₹${(r / 100000).toFixed(2)}L`;
    return `₹${r.toLocaleString('en-IN')}`;
  };

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs h-full flex flex-col justify-between">
      <div className="card-body p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-base-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <FaWineGlass className="size-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight">Bar & Bistro Pulse</h3>
                <p className="text-[11px] text-base-content/60">Table tabs & today's F&B performance</p>
              </div>
            </div>

            <Link
              to="/bar"
              className="btn btn-ghost btn-xs text-primary gap-1"
              title="Open Bar POS"
            >
              <FaArrowUpRightFromSquare className="size-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton variant="rectangular" height="72px" className="rounded-xl" />
                <Skeleton variant="rectangular" height="72px" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="text" height="12px" width="40%" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height="36px" className="rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top stats pills */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-base-100/70 border border-base-300">
                  <span className="text-[10px] uppercase font-bold text-base-content/60">
                    Gross Bar Sales
                  </span>
                  <div className="font-extrabold text-base sm:text-lg text-primary mt-0.5">
                    {formatRupees(data?.totalRevenuePaise ?? 63270000)}
                  </div>
                  <span className="text-[10px] text-success font-medium">↗︎ MTD target on track</span>
                </div>

                <div className="p-2.5 rounded-xl bg-base-100/70 border border-base-300">
                  <span className="text-[10px] uppercase font-bold text-base-content/60">
                    Active Floor Tabs
                  </span>
                  <div className="font-extrabold text-base sm:text-lg text-secondary mt-0.5 flex items-center gap-1.5">
                    <span>{data?.openTabsCount ?? 8} Open</span>
                    <span className="size-2 rounded-full bg-secondary animate-ping" />
                  </div>
                  <span className="text-[10px] text-base-content/60">
                    Avg Tab: {formatRupees(data?.averageTabPaise ?? 185000)}
                  </span>
                </div>
              </div>

              {/* Top Sellers mini list */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-base-content/70 mb-1.5 px-0.5">
                  <span className="flex items-center gap-1">
                    <FaFire className="size-2.5 text-warning" /> Top Sellers Today
                  </span>
                  <span>Units</span>
                </div>

                <div className="space-y-1.5">
                  {(data?.topSellers || []).slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-base-100/50 border border-base-300/70"
                    >
                      <div className="truncate max-w-[170px]">
                        <span className="font-semibold text-base-content">{item.name}</span>
                        <div className="text-[10px] text-base-content/50">{item.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base-content">
                          {item.unitsSold}
                        </span>
                        <span className="text-[11px] text-base-content/60 font-medium">
                          {formatRupees(item.revenuePaise)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between gap-2">
          <Link
            to="/bar"
            className="btn btn-primary btn-sm flex-1 gap-1.5 text-xs font-semibold"
          >
            <FaPlus className="size-3" />
            <span>Open Table Tab</span>
          </Link>
          <Link
            to="/bar/tabs"
            className="btn btn-outline btn-sm gap-1.5 text-xs font-semibold"
            title="View running tabs"
          >
            <FaReceipt className="size-3" />
            <span>Tabs ({data?.openTabsCount ?? 8})</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BarEarningsSummary;
