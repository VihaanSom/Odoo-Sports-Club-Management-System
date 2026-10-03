import { FaCalendarCheck } from 'react-icons/fa6';
import { Badge } from '@/components/ui';
import { formatPaise, formatDate } from '@/lib/utils';
import type { MemberHistoryBooking } from '@/types/members';

interface MemberBookingHistoryProps {
  bookings: MemberHistoryBooking[];
}

export const MemberBookingHistory = ({ bookings }: MemberBookingHistoryProps) => {
  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2">
          <FaCalendarCheck className="size-4 text-primary" /> Booking History ({bookings.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-base-300/40">
              <th>Booking ID</th>
              <th>Court / Facility</th>
              <th>Sport</th>
              <th>Date & Slot</th>
              <th>Paid</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-base-300/30">
                <td className="font-mono font-bold text-xs">{b.id}</td>
                <td className="font-semibold">{b.courtName}</td>
                <td>
                  <span className="capitalize badge badge-xs badge-ghost py-2">
                    {b.sport}
                  </span>
                </td>
                <td className="text-xs text-base-content/80 font-mono">
                  {formatDate(b.slotStart)}
                </td>
                <td className="font-semibold text-primary">
                  {formatPaise(b.amountPaidPaise)}
                </td>
                <td>
                  <Badge
                    size="xs"
                    variant={
                      b.status === 'confirmed' || b.status === 'in_progress'
                        ? 'success'
                        : b.status === 'upcoming'
                        ? 'secondary'
                        : 'error'
                    }
                  >
                    {b.status === 'in_progress' ? 'in progress' : b.status.replace(/_/g, ' ')}
                  </Badge>
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/50">
                  No court bookings on record.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
