import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTrophy, FaCalendarDays } from 'react-icons/fa6';
import { Avatar, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Member, MemberDetail } from '@/types';

interface MembersTableProps {
  members: (Member | MemberDetail)[];
}

export const MembersTable = ({ members }: MembersTableProps) => {
  const navigate = useNavigate();

  const getTierBadge = (tierStr?: string) => {
    const tier = tierStr || 'Gold';
    if (tier === 'Gold' || tier === 'VIP') {
      return (
        <Badge size="sm" variant="warning" className="gap-1 font-bold">
          <FaTrophy className="size-3 text-amber-500" />
          {tier}
        </Badge>
      );
    }
    if (tier === 'Silver' || tier === 'Premium') {
      return (
        <Badge size="sm" variant="secondary" className="gap-1 font-bold">
          <FaTrophy className="size-3 text-slate-400" />
          {tier}
        </Badge>
      );
    }
    return (
      <Badge size="sm" variant="ghost" className="gap-1 font-bold border border-base-300">
        <FaTrophy className="size-3 text-info" />
        {tier}
      </Badge>
    );
  };

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-sm">
          <thead>
            <tr className="bg-base-300/40">
              <th>Member</th>
              <th>Contact</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Membership End</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const displayName =
                member.name ||
                `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
                'Club Member';

              return (
                <tr key={member.id} className="hover:bg-base-300/30">
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.photoUrl || member.avatarUrl}
                        fallbackText={displayName}
                        size="md"
                      />
                      <div>
                        <div className="font-bold text-base-content">{displayName}</div>
                        <div className="text-xs text-base-content/60 font-mono">#{member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col text-xs gap-0.5">
                      <span className="flex items-center gap-1.5 text-base-content/90">
                        <FaEnvelope className="size-3 text-base-content/50" />
                        {member.email}
                      </span>
                      {member.phone ? (
                        <span className="flex items-center gap-1.5 text-base-content/70">
                          <FaPhone className="size-3 text-base-content/50" />
                          {member.phone}
                        </span>
                      ) : (
                        <span className="text-base-content/40 italic">No phone</span>
                      )}
                    </div>
                  </td>
                  <td>{getTierBadge(member.tier || (member as any).membershipPlan)}</td>
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
                  <td className="text-xs text-base-content/70 font-mono">
                    {member.membershipEnd ? (
                      <span className="flex items-center gap-1">
                        <FaCalendarDays className="size-3 text-base-content/40" />
                        {formatDate(member.membershipEnd)}
                      </span>
                    ) : member.membershipStart || member.joinedDate ? (
                      formatDate(member.membershipStart || member.joinedDate || '')
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-primary font-bold"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-base-content/60">
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
