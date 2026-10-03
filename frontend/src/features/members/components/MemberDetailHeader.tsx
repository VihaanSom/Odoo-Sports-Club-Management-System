import { useNavigate } from 'react-router-dom';
import {
  FaTrophy,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaCalendarDays,
  FaRotateRight,
  FaPenToSquare,
  FaClock,
} from 'react-icons/fa6';
import { Avatar, Badge, Button } from '@/components/ui';
import { formatPaise, formatDate } from '@/lib/utils';
import type { MemberDetail } from '@/types/members';

interface MemberDetailHeaderProps {
  member: MemberDetail;
  onOpenEdit: () => void;
  onOpenRenew: () => void;
}

export const MemberDetailHeader = ({
  member,
  onOpenEdit,
  onOpenRenew,
}: MemberDetailHeaderProps) => {
  const navigate = useNavigate();

  // Compute days remaining
  const calculateDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining(member.membershipEnd);
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
  const isExpired = daysRemaining <= 0 || member.status === 'expired';

  const displayName =
    member.name ||
    `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
    'Club Member';

  return (
    <div className="card bg-base-200/50 border border-base-300 p-6 shadow-xs space-y-6">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<FaArrowLeft className="size-3.5" />}
          onClick={() => navigate('/members')}
        >
          Back
        </Button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FaPenToSquare className="size-3.5" />}
            onClick={onOpenEdit}
          >
            Edit Profile
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaRotateRight className="size-3.5 border-rounded" />}
            onClick={onOpenRenew}
          >
            Renew
          </Button>
        </div>
      </div>

      {/* Main profile row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar
            src={member.photoUrl || member.avatarUrl}
            fallbackText={displayName}
            size="xl"
            className="ring-2 ring-primary/30"
          />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
                {displayName}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-base-300 text-base-content/80 font-bold">
                #{member.id}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Tier badge with FaTrophy */}
              <Badge
                size="sm"
                variant={
                  member.tier === 'Gold' || member.tier === 'VIP'
                    ? 'warning'
                    : member.tier === 'Silver' || member.tier === 'Premium'
                      ? 'secondary'
                      : 'ghost'
                }
                className="gap-1.5 font-bold"
              >
                <FaTrophy className={
                  member.tier === 'Gold' || member.tier === 'VIP'
                    ? 'size-3 text-amber-500'
                    : member.tier === 'Silver' || member.tier === 'Premium'
                      ? 'size-3 text-slate-400'
                      : 'size-3 text-info'
                } />
                {member.tier || member.membershipPlan}
              </Badge>

              {/* Status badge */}
              <Badge
                size="sm"
                variant={
                  member.status === 'active'
                    ? 'success'
                    : member.status === 'suspended'
                      ? 'warning'
                      : 'error'
                }
                className="capitalize gap-1.5"
              >
                <span className="size-1.5 rounded-full bg-current" />
                {member.status}
              </Badge>

              {/* Days remaining badge */}
              <span
                className={`badge badge-sm font-medium ${isExpired
                    ? 'badge-error text-error-content'
                    : isExpiringSoon
                      ? 'badge-warning text-warning-content'
                      : 'badge-ghost text-base-content/70'
                  }`}
              >
                <FaClock className="size-2.5 mr-1" />
                {isExpired
                  ? 'Expired'
                  : `${daysRemaining} days left`}
              </span>
            </div>

            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-base-content/70">
              <span className="flex items-center gap-1.5">
                <FaEnvelope className="size-3 text-base-content/40" />
                {member.email}
              </span>
              <span className="flex items-center gap-1.5">
                <FaPhone className="size-3 text-base-content/40" />
                {member.phone}
              </span>
              {member.membershipEnd && (
                <span className="flex items-center gap-1.5">
                  <FaCalendarDays className="size-3 text-base-content/40" />
                  Expires: {formatDate(member.membershipEnd)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Financial & activity metrics pills */}
        <div className="grid grid-cols-3 gap-3 bg-base-100 p-3 rounded-2xl border border-base-300 self-stretch md:self-auto min-w-[280px]">
          <div className="text-center p-2 rounded-xl bg-base-200/50">
            <span className="text-[10px] uppercase font-bold text-base-content/50 block tracking-wider">
              Bookings
            </span>
            <span className="text-base font-extrabold text-base-content">
              {member.summary?.totalBookings ?? 0}
            </span>
          </div>

          <div className="text-center p-2 rounded-xl bg-base-200/50">
            <span className="text-[10px] uppercase font-bold text-base-content/50 block tracking-wider">
              Orders
            </span>
            <span className="text-base font-extrabold text-base-content">
              {member.summary?.totalOrders ?? 0}
            </span>
          </div>

          <div className="text-center p-2 rounded-xl bg-base-200/50">
            <span className="text-[10px] uppercase font-bold text-base-content/50 block tracking-wider">
              Spent
            </span>
            <span className="text-base font-extrabold text-primary">
              {formatPaise(member.summary?.totalSpentPaise ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
