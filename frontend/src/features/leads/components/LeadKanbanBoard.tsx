import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUserTie,
  FaPhone,
  FaArrowRight,
  FaCheck,
  FaXmark,
  FaGripVertical,
} from 'react-icons/fa6';
import { Badge } from '@/components/ui';
import { formatDate, cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types/leads';
import type { StaffMember } from '@/types/staff';
import { staffService } from '@/services/staffService';
import { leadService } from '@/services/leadService';

interface LeadKanbanBoardProps {
  leads: Lead[];
  onTransitionStage: (id: number | string, newStatus: LeadStatus) => Promise<void>;
  onAssignLead?: (id: number | string, staffId: number | null) => Promise<void>;
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

export const LeadKanbanBoard = ({
  leads,
  onTransitionStage,
  onAssignLead,
}: LeadKanbanBoardProps) => {
  const navigate = useNavigate();
  const [draggedLeadId, setDraggedLeadId] = useState<string | number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    let isMounted = true;
    staffService
      .getStaffMembers({ limit: 100 })
      .then((res) => {
        if (isMounted) setStaffMembers(res.data);
      })
      .catch(() => {
        // Fallback silently if offline or error
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAssignStaff = async (leadId: number | string, staffId: number | null) => {
    try {
      await leadService.assignLead(leadId, staffId);
      if (onAssignLead) {
        await onAssignLead(leadId, staffId);
      }
      const staffName = staffId
        ? staffMembers.find((s) => String(s.id) === String(staffId))?.name || `Staff #${staffId}`
        : 'Unassigned';
      toast.success(staffId ? `Assigned to ${staffName}` : 'Lead marked unassigned');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign staff');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string | number) => {
    e.dataTransfer.setData('text/plain', String(leadId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, colStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(colStatus);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, colStatus: LeadStatus) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverColumn === colStatus) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, colStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    setDraggedLeadId(null);
    const rawId = e.dataTransfer.getData('text/plain');
    if (rawId) {
      onTransitionStage(rawId, colStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.status);
        const isColumnOver = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, col.status)}
            onDragLeave={(e) => handleDragLeave(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={cn(
              'flex flex-col rounded-2xl bg-base-200/50 border p-3.5 space-y-3 min-h-[520px] transition-all duration-150',
              isColumnOver
                ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                : 'border-base-300'
            )}
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

            {/* Drop Indicator */}
            {isColumnOver && (
              <div className="p-2 rounded-xl bg-primary/20 border-2 border-dashed border-primary text-center text-xs font-bold text-primary animate-pulse">
                Drop to move to {col.label}
              </div>
            )}

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-1">
              {columnLeads.map((lead) => {
                const isBeingDragged = String(draggedLeadId) === String(lead.id);

                return (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'card bg-base-100 border p-4 shadow-2xs hover:shadow-md transition-all rounded-xl space-y-3 cursor-grab active:cursor-grabbing select-none',
                      col.borderClass,
                      isBeingDragged && 'opacity-40 scale-95 border-dashed border-primary'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <FaGripVertical className="size-3 text-base-content/30 shrink-0 cursor-grab" />
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
                      </div>

                      {lead.sport && (
                        <Badge size="xs" variant="ghost" className="capitalize">
                          {lead.sport}
                        </Badge>
                      )}
                    </div>

                    {lead.message && (
                      <p className="text-xs text-base-content/70 line-clamp-2 pl-4">
                        {lead.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-base-content/60 pt-1 border-t border-base-200">
                      <span className="flex items-center gap-1 font-mono">
                        {lead.phone && <FaPhone className="size-2.5 text-base-content/40" />}
                        {lead.phone || lead.email || 'No contact'}
                      </span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <FaUserTie className="size-2.5 text-base-content/40 shrink-0" />
                        <select
                          value={lead.assignedTo ?? ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value;
                            handleAssignStaff(lead.id, val ? Number(val) : null);
                          }}
                          className="select select-ghost select-xs text-[10px] h-5 min-h-5 px-1 py-0 border border-base-300 rounded font-medium bg-base-100 hover:border-primary/50 focus:border-primary max-w-[110px]"
                          title="Assign lead to staff"
                        >
                          <option value="">Unassigned</option>
                          {staffMembers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Stage Progression Buttons */}
                    <div className="pt-1 flex items-center justify-end gap-1.5 border-t border-base-200">
                      {lead.status === 'new' && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTransitionStage(lead.id, 'contacted');
                            }}
                            className="btn btn-warning btn-xs gap-1 font-semibold"
                            title="Mark Contacted"
                          >
                            <FaArrowRight className="size-2.5" /> Next
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTransitionStage(lead.id, 'lost');
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              onTransitionStage(lead.id, 'converted');
                            }}
                            className="btn btn-success btn-xs text-success-content gap-1 font-semibold"
                            title="Convert to Member"
                          >
                            <FaCheck className="size-2.5" /> Next
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTransitionStage(lead.id, 'lost');
                            }}
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
                );
              })}

              {columnLeads.length === 0 && !isColumnOver && (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-base-300 rounded-xl text-xs text-base-content/40 font-medium">
                  Drag leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
