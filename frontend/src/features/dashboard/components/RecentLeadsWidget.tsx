import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBullhorn,
  FaArrowUpRightFromSquare,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa6';
import { leadService } from '@/services/leadService';
import type { Lead } from '@/types/leads';

export const RecentLeadsWidget = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLeads = async () => {
      try {
        const res = await leadService.getAll();
        if (isMounted) {
          setLeads(res.slice(0, 5));
        }
      } catch {
        // Handled in service
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeads();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return <span className="badge badge-error badge-xs font-bold uppercase tracking-wider">New</span>;
      case 'contacted':
        return <span className="badge badge-warning badge-xs font-semibold">Contacted</span>;
      case 'converted':
        return <span className="badge badge-success badge-xs font-semibold">Converted</span>;
      default:
        return <span className="badge badge-neutral badge-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs h-full flex flex-col justify-between">
      <div className="card-body p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-base-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <FaBullhorn className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">Recent Enquiries</h3>
                  {leads.filter((l) => l.status === 'new').length > 0 && (
                    <span className="badge badge-error badge-xs font-bold">
                      {leads.filter((l) => l.status === 'new').length} New
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-base-content/60">Public website trials & membership leads</p>
              </div>
            </div>

            <Link
              to="/leads"
              className="btn btn-ghost btn-xs text-primary gap-1"
              title="View full CRM leads funnel"
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
          ) : leads.length === 0 ? (
            <div className="text-center py-6 text-xs text-base-content/60">
              No recent enquiries logged.
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map((l) => (
                <div
                  key={l.id}
                  className="p-2.5 rounded-xl border border-base-300 bg-base-100/70 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-base-content truncate">
                        {l.name}
                      </span>
                      {getStatusBadge(l.status)}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-base-content/60 mt-0.5">
                      {l.sport && <span className="capitalize font-medium">{l.sport}</span>}
                      {l.phone && (
                        <span className="flex items-center gap-0.5">
                          <FaPhone className="size-2 text-base-content/40" /> {l.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {l.email && (
                      <a
                        href={`mailto:${l.email}`}
                        className="btn btn-ghost btn-xs size-7 p-0 text-base-content/70 hover:text-primary"
                        title={l.email}
                      >
                        <FaEnvelope className="size-3" />
                      </a>
                    )}
                    <Link
                      to={`/leads/${l.id}`}
                      className="btn btn-ghost btn-xs text-primary font-semibold hover:bg-primary/10"
                    >
                      Follow-up
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between text-xs text-base-content/60">
          <span>Inbound marketing funnel active</span>
          <Link to="/leads" className="link link-primary font-medium text-[11px]">
            Manage Leads &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentLeadsWidget;
