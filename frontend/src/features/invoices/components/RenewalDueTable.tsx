import { useNavigate } from 'react-router-dom';
import { FaClock, FaTrophy, FaEye } from 'react-icons/fa6';
import { Badge } from '@/components/ui';
import { formatPaise, formatDate } from '@/lib/utils';
import type { RenewalDueMember, MemberInvoice } from '@/types/invoices';
import { GenerateInvoiceButton } from './GenerateInvoiceButton';

interface RenewalDueTableProps {
  renewalDues: RenewalDueMember[];
  onInvoiceGenerated: (invoice: MemberInvoice) => void;
  onPreviewInvoice?: (invoiceNumber: string) => void;
}

export const RenewalDueTable = ({
  renewalDues,
  onInvoiceGenerated,
  onPreviewInvoice,
}: RenewalDueTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-base-300/40">
              <th>Member</th>
              <th>Tier</th>
              <th>Membership End</th>
              <th>Time Remaining</th>
              <th>Renewal Fee</th>
              <th>Invoice Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renewalDues.map((item) => {
              const isExpired = item.daysRemaining <= 0;
              const isUrgent = item.daysRemaining > 0 && item.daysRemaining <= 7;

              return (
                <tr key={item.memberId} className="hover:bg-base-300/30">
                  <td>
                    <button
                      type="button"
                      onClick={() => navigate(`/members/${item.memberId}`)}
                      className="font-bold text-base-content hover:text-primary transition-colors text-left cursor-pointer"
                    >
                      {item.name}
                    </button>
                    <div className="text-[11px] text-base-content/50 font-mono">
                      {item.memberId} {item.phone ? `· ${item.phone}` : ''}
                    </div>
                  </td>

                  <td>
                    <Badge
                      size="sm"
                      variant={
                        item.tier === 'VIP'
                          ? 'warning'
                          : item.tier === 'Premium'
                          ? 'secondary'
                          : 'ghost'
                      }
                      className="gap-1 font-bold"
                    >
                      <FaTrophy className="size-2.5 text-amber-500" />
                      {item.tier}
                    </Badge>
                  </td>

                  <td className="font-mono text-xs text-base-content/80">
                    {formatDate(item.membershipEnd)}
                  </td>

                  <td>
                    <span
                      className={`badge badge-sm font-medium gap-1 ${
                        isExpired
                          ? 'badge-error text-error-content'
                          : isUrgent
                          ? 'badge-warning text-warning-content'
                          : 'badge-ghost text-base-content/70'
                      }`}
                    >
                      <FaClock className="size-2.5" />
                      {isExpired
                        ? 'Expired'
                        : `${item.daysRemaining} days left`}
                    </span>
                  </td>

                  <td className="font-bold text-primary font-mono">
                    {formatPaise(item.renewalAmountPaise)}
                  </td>

                  <td>
                    {item.lastInvoiceNumber ? (
                      <button
                        type="button"
                        onClick={() => onPreviewInvoice && onPreviewInvoice(item.lastInvoiceNumber!)}
                        className="badge badge-sm badge-info font-mono gap-1 cursor-pointer hover:opacity-80"
                      >
                        <FaEye className="size-2.5" /> {item.lastInvoiceNumber}
                      </button>
                    ) : (
                      <span className="text-xs text-base-content/50 italic">
                        Not Generated
                      </span>
                    )}
                  </td>

                  <td className="text-right">
                    <GenerateInvoiceButton
                      memberId={item.memberId}
                      memberName={item.name}
                      hasExistingInvoice={!!item.lastInvoiceNumber}
                      onInvoiceGenerated={onInvoiceGenerated}
                      size="xs"
                    />
                  </td>
                </tr>
              );
            })}

            {renewalDues.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-base-content/50">
                  No members currently due for renewal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
