import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaUserTie } from 'react-icons/fa6';
import { Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Lead } from '@/types/leads';

interface LeadsTableProps {
  leads: Lead[];
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  const navigate = useNavigate();

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-base-300/40">
              <th>Lead Name</th>
              <th>Contact Info</th>
              <th>Sport / Interest</th>
              <th>Status</th>
              <th>Assigned Staff</th>
              <th>Captured Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-base-300/30">
                <td>
                  <div className="font-bold text-base-content">{lead.name}</div>
                  <div className="text-[11px] text-base-content/50 font-mono">
                    ID: #{lead.id}
                  </div>
                </td>

                <td>
                  <div className="flex flex-col text-xs gap-0.5">
                    {lead.email && (
                      <span className="flex items-center gap-1.5 text-base-content/90">
                        <FaEnvelope className="size-3 text-base-content/40" />
                        {lead.email}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="flex items-center gap-1.5 text-base-content/70">
                        <FaPhone className="size-3 text-base-content/40" />
                        {lead.phone}
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  {lead.sport ? (
                    <span className="badge badge-sm badge-ghost capitalize font-medium">
                      {lead.sport}
                    </span>
                  ) : (
                    <span className="text-xs text-base-content/50 italic">General Enquiry</span>
                  )}
                  {lead.message && (
                    <p className="text-[11px] text-base-content/60 truncate max-w-xs mt-0.5">
                      {lead.message}
                    </p>
                  )}
                </td>

                <td>
                  <Badge
                    size="sm"
                    variant={
                      lead.status === 'converted'
                        ? 'success'
                        : lead.status === 'contacted'
                        ? 'warning'
                        : lead.status === 'new'
                        ? 'accent'
                        : 'error'
                    }
                    className="capitalize font-semibold gap-1.5"
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {lead.status}
                  </Badge>
                </td>

                <td>
                  <span className="flex items-center gap-1.5 text-xs text-base-content/80 font-medium">
                    <FaUserTie className="size-3 text-base-content/40" />
                    {lead.assignedStaffName || 'Unassigned'}
                  </span>
                </td>

                <td className="text-xs text-base-content/70 font-mono">
                  {formatDate(lead.createdAt)}
                </td>

                <td className="text-right">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-primary"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-base-content/50">
                  No leads found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
