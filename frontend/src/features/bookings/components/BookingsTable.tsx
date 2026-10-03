import { Link } from 'react-router-dom';
import {
  FaCalendarDays,
  FaClock,
  FaUser,
  FaEye,
  FaBan,
  FaCheck,
  FaUsers,
  FaIndianRupeeSign,
} from 'react-icons/fa6';
import { formatDate } from '@/lib/utils';
import type { BookingDetail } from '@/types/bookings';
import type { Booking } from '@/types/models';

interface BookingsTableProps {
  bookings: (BookingDetail | Booking)[];
  onCancel?: (id: number) => void;
}

export const BookingsTable = ({ bookings, onCancel }: BookingsTableProps) => {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-xs overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-sm">
          <thead>
            <tr className="bg-base-200/60 text-xs font-bold uppercase tracking-wider text-base-content/70">
              <th>Ref</th>
              <th>Court / Facility</th>
              <th>Player / Guest</th>
              <th>Schedule</th>
              <th>Type</th>
              <th>Paid</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-base-content/60 text-sm">
                  No bookings found matching current filters.
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const isDetail = 'courtId' in b && typeof b.id === 'number';
                const detail = isDetail ? (b as BookingDetail) : null;
                const legacy = !isDetail ? (b as Booking) : null;

                const bookingId = detail ? detail.id : legacy?.id;
                const facilityName = detail ? detail.courtName : legacy?.facilityName;
                const playerName = detail
                  ? detail.memberName || detail.guestName || `Member #${detail.memberId}`
                  : legacy?.memberName;
                const bookingType = detail ? detail.bookingType : 'member';
                const status = detail ? detail.status : legacy?.status;
                const isCancelled = status === 'cancelled';

                let scheduleTime = '';
                let scheduleDate = '';

                if (detail) {
                  const startD = new Date(detail.slotStart);
                  const endD = new Date(detail.slotEnd);
                  scheduleTime = `${startD.getUTCHours().toString().padStart(2, '0')}:00 - ${endD
                    .getUTCHours()
                    .toString()
                    .padStart(2, '0')}:00`;
                  scheduleDate = formatDate(detail.slotStart);
                } else if (legacy) {
                  scheduleTime = `${legacy.startTime} - ${legacy.endTime}`;
                  scheduleDate = formatDate(legacy.date);
                }

                const priceDisplay = detail
                  ? (detail.amountPaidPaise / 100).toFixed(0)
                  : legacy
                  ? legacy.totalPrice.toString()
                  : '0';

                return (
                  <tr key={String(bookingId)} className="hover:bg-base-200/50 transition-colors">
                    <td>
                      <Link
                        to={`/bookings/${detail ? detail.id : 101}`}
                        className="font-mono text-xs font-bold text-primary hover:underline"
                      >
                        #{bookingId}
                      </Link>
                    </td>

                    <td className="font-semibold text-base-content">{facilityName}</td>

                    <td>
                      <div className="flex items-center gap-1.5">
                        {bookingType === 'social' ? (
                          <FaUsers className="size-3 text-secondary" />
                        ) : (
                          <FaUser className="size-3 text-base-content/50" />
                        )}
                        <span className="font-medium text-xs">{playerName}</span>
                      </div>
                    </td>

                    <td>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium flex items-center gap-1 text-base-content">
                          <FaClock className="size-3 text-base-content/50" />
                          {scheduleTime}
                        </span>
                        <span className="text-base-content/60 flex items-center gap-1 text-[11px]">
                          <FaCalendarDays className="size-3 text-base-content/40" />
                          {scheduleDate}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-xs badge-outline uppercase text-[10px] font-bold">
                        {bookingType === 'walk_in' ? 'WALK IN' : bookingType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="font-mono text-xs font-bold">
                      <span className="inline-flex items-center">
                        <FaIndianRupeeSign className="size-2.5 mr-0.5" />
                        {priceDisplay}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge badge-sm font-semibold capitalize text-xs gap-1 ${
                          isCancelled
                            ? 'badge-error'
                            : status === 'confirmed' || status === 'upcoming'
                            ? 'badge-success'
                            : 'badge-neutral'
                        }`}
                      >
                        {isCancelled ? (
                          <FaBan className="size-2.5" />
                        ) : (
                          <FaCheck className="size-2.5" />
                        )}
                        {status}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="tooltip tooltip-left" data-tip="View Details">
                          <Link
                            to={`/bookings/${detail ? detail.id : 101}`}
                            className="btn btn-ghost btn-xs btn-circle"
                          >
                            <FaEye className="size-3 text-base-content/70" />
                          </Link>
                        </div>
                        {!isCancelled && onCancel && detail && (
                          <div className="tooltip tooltip-left" data-tip="Cancel Booking">
                            <button
                              type="button"
                              onClick={() => onCancel(detail.id)}
                              className="btn btn-ghost btn-xs btn-circle text-error/70 hover:text-error"
                            >
                              <FaBan className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
