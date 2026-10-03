import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserTie,
  FaPhone,
  FaArrowRight,
  FaCheck,
  FaXmark,
} from 'react-icons/fa6';
import { Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types/leads';

interface LeadKanbanBoardProps {
  leads: Lead[];
  onTransitionStage: (id: number | string, newStatus: LeadStatus) => Promise<void>;
}

interface ColumnDef {
  status: LeadStatus;
  label: string;
  badgeClass: string;
  borderClass: string;
}

const columns: ColumnDef[] = [
  {
    status: 'new',
    label: 'New Enquiries',
    badgeClass: 'badge-accent',
    borderClass: 'border-accent/40',
  },
  {
    status: 'contacted',
    label: 'Contacted',
    badgeClass: 'badge-warning',
    borderClass: 'border-warning/40',
  },
  {
    status: 'converted',
    label: 'Converted',
    badgeClass: 'badge-success',
    borderClass: 'border-success/40',
  },
  {
    status: 'lost',
    label: 'Lost / Closed',
    badgeClass: 'badge-error',
    borderClass: 'border-error/40',
  },
];

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  leads,
  onTransitionStage,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.status);

        return (
          <div
            key={col.status}
            className="flex flex-col rounded-2xl bg-base-200/50 border border-base-300 p-3.5 space-y-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1.5 pb-2 border-b border-base-300">
              <span className="font-extrabold text-xs uppercase tracking-wider text-base-content/80">
                {col.label}
              </span>
              <span className={`badge badge-sm font-bold ${col.badgeClass}`}>
                {columnLeads.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-1">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`card bg-base-100 border p-4 shadow-2xs hover:shadow-sm transition-all rounded-xl space-y-3 ${col.borderClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="text-left font-bold text-sm text-base-content hover:text-primary transition-colors cursor-pointer"
                      >
                        {lead.name}
                      </button>
                      <span className="text-[10px] text-base-content/50 block font-mono">
                        #{lead.id} · {formatDate(lead.createdAt)}
                      </span>
                    </div>

                    {lead.sport && (
                      <Badge size="xs" variant="ghost" className="capitalize">
                        {lead.sport}
                      </Badge>
                    )}
                  </div>

                  {lead.message && (
                    <p className="text-xs text-base-content/70 line-clamp-2">
                      {lead.message}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-base-content/60 pt-1 border-t border-base-200">
                    <span className="flex items-center gap-1 font-mono">
                      {lead.phone && <FaPhone className="size-2.5 text-base-content/40" />}
                      {lead.phone || lead.email || 'No contact'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUserTie className="size-2.5 text-base-content/40" />
                      {lead.assignedStaffName?.split(' ')[0] || 'Unassigned'}
                    </span>
                  </div>

                  {/* Quick Stage Progression Buttons */}
                  <div className="pt-1 flex items-center justify-end gap-1.5 border-t border-base-200">
                    {lead.status === 'new' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onTransitionStage(lead.id, 'contacted')}
                          className="btn btn-warning btn-xs gap-1 font-semibold"
                          title="Mark Contacted"
                        >
                          <FaArrowRight className="size-2.5" /> Next
                        </button>
                        <button
                          type="button"
                          onClick={() => onTransitionStage(lead.id, 'lost')}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          title="Mark Lost"
                        >
                          <FaXmark className="size-2.5" />
                        </button>
                      </>
                    )}

                    {lead.status === 'contacted' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onTransitionStage(lead.id, 'converted')}
                          className="btn btn-success btn-xs text-success-content gap-1 font-semibold"
                          title="Convert to Member"
                        >
                          <FaCheck className="size-2.5" /> Next
                        </button>
                        <button
                          type="button"
                          onClick={() => onTransitionStage(lead.id, 'lost')}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          title="Mark Lost"
                        >
                          <FaXmark className="size-2.5" />
                        </button>
                      </>
                    )}

                    {lead.status === 'converted' && (
                      <span className="text-[11px] text-success font-bold flex items-center gap-1">
                        <FaCheck className="size-3" /> Member
                      </span>
                    )}

                    {lead.status === 'lost' && (
                      <span className="text-[11px] text-error font-medium flex items-center gap-1">
                        <FaXmark className="size-3" /> Closed
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {columnLeads.length === 0 && (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-base-300 rounded-xl text-xs text-base-content/40 font-medium">
                  No leads in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
