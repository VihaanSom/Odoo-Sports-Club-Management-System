import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone } from 'react-icons/fa6';
import { Avatar, Badge } from '@/components/ui';
import type { Member } from '@/types';

interface MembersTableProps {
  members: Member[];
}

export const MembersTable: React.FC<MembersTableProps> = ({ members }) => {
  const navigate = useNavigate();

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-sm">
          <thead>
            <tr className="bg-base-300/40">
              <th>Member</th>
              <th>Contact</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-base-300/30">
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.avatarUrl}
                      fallbackText={member.name}
                      size="md"
                    />
                    <div>
                      <div className="font-bold">{member.name}</div>
                      <div className="text-xs text-base-content/60 font-mono">{member.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col text-xs gap-0.5">
                    <span className="flex items-center gap-1.5 text-base-content/90">
                      <FaEnvelope className="size-3 text-base-content/50" />
                      {member.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-base-content/70">
                      <FaPhone className="size-3 text-base-content/50" />
                      {member.phone}
                    </span>
                  </div>
                </td>
                <td>
                  <Badge
                    size="sm"
                    variant={
                      member.membershipPlan === 'VIP'
                        ? 'warning'
                        : member.membershipPlan === 'Premium'
                        ? 'secondary'
                        : 'ghost'
                    }
                  >
                    {member.membershipPlan}
                  </Badge>
                </td>
                <td>
                  <Badge
                    size="xs"
                    variant={
                      member.status === 'active'
                        ? 'success'
                        : member.status === 'suspended'
                        ? 'warning'
                        : 'error'
                    }
                    className="capitalize gap-1.5 py-2 px-2.5"
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {member.status}
                  </Badge>
                </td>
                <td className="text-xs text-base-content/70 font-mono">{member.joinedDate}</td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-primary"
                    onClick={() => navigate(`/members/${member.id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/60">
                  No members found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
