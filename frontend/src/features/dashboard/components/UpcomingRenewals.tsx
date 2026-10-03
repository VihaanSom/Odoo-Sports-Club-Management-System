import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaClockRotateLeft,
  FaFileInvoiceDollar,
  FaArrowUpRightFromSquare,
  FaEnvelope,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { invoiceService } from '@/services/invoiceService';
import type { RenewalDueMember } from '@/types/invoices';

export const UpcomingRenewals = () => {
  const [dues, setDues] = useState<RenewalDueMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDues = async () => {
      try {
        const res = await invoiceService.getRenewalDues();
        if (isMounted) {
          setDues(res.slice(0, 5));
        }
      } catch {
        // Handled in service
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDues();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerateInvoice = async (memberId: string | number, name: string) => {
    setGeneratingId(memberId);
    try {
      const res = await invoiceService.generateInvoice(memberId);
      toast.success(`Generated invoice ${res.invoiceNumber} for ${name}`);
    } catch {
      toast.error('Failed to generate invoice');
    } finally {
      setGeneratingId(null);
    }
  };

  const getDaysBadge = (days: number) => {
    if (days <= 7) {
      return <span className="badge badge-error badge-xs font-bold">{days} days left</span>;
    }
    if (days <= 14) {
      return <span className="badge badge-warning badge-xs font-semibold">{days} days left</span>;
    }
    return <span className="badge badge-info badge-xs font-medium">{days} days left</span>;
  };

  const getTierBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'vip':
        return <span className="badge badge-warning badge-outline badge-xs font-bold">VIP</span>;
      case 'premium':
        return <span className="badge badge-primary badge-outline badge-xs font-semibold">Premium</span>;
      default:
        return <span className="badge badge-neutral badge-outline badge-xs font-medium">{tier}</span>;
    }
  };

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs h-full flex flex-col justify-between">
      <div className="card-body p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-base-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <FaClockRotateLeft className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">Upcoming Renewals</h3>
                  {dues.length > 0 && (
                    <span className="badge badge-info badge-xs font-bold">{dues.length} Due</span>
                  )}
                </div>
                <p className="text-[11px] text-base-content/60">Memberships expiring within 30 days</p>
              </div>
            </div>

            <Link
              to="/members"
              className="btn btn-ghost btn-xs text-primary gap-1"
              title="View members"
            >
              <FaArrowUpRightFromSquare className="size-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-base-300/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : dues.length === 0 ? (
            <div className="text-center py-6 text-xs text-base-content/60">
              No pending membership renewals.
            </div>
          ) : (
            <div className="space-y-2">
              {dues.map((m) => (
                <div
                  key={m.memberId}
                  className="p-2.5 rounded-xl border border-base-300 bg-base-100/70 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-base-content truncate">
                        {m.name}
                      </span>
                      {getTierBadge(m.tier)}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-base-content/60 mt-0.5">
                      <span>₹{(m.renewalAmountPaise / 100).toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>Expires {m.membershipEnd}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getDaysBadge(m.daysRemaining)}
                    <button
                      type="button"
                      disabled={generatingId === m.memberId}
                      onClick={() => handleGenerateInvoice(m.memberId, m.name)}
                      className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-1 font-semibold"
                      title="Send Renewal Invoice"
                    >
                      <FaFileInvoiceDollar className="size-3" />
                      <span className="hidden sm:inline">Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between text-xs text-base-content/60">
          <span>Automated email reminder queue enabled</span>
          <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
            <FaEnvelope className="size-3" /> Ready
          </span>
        </div>
      </div>
    </div>
  );
};

export default UpcomingRenewals;
