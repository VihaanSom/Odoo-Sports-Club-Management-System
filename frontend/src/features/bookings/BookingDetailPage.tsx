import {  useState, useEffect, useCallback  } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FaCalendarCheck,
  FaArrowLeft,
  FaClock,
  FaLocationDot,
  FaUser,
  FaCreditCard,
  FaBan,
  FaCheck,
  FaUsers,
  FaNoteSticky,
  FaIndianRupeeSign,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { bookingService } from '@/services/bookingService';
import { formatDate, formatSlotRange } from '@/lib/utils';
import type { BookingDetail } from '@/types/bookings';
import { BookingCancelModal } from './components/BookingCancelModal';

export const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id || '0', 10);

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!numericId) return;
    setLoading(true);
    try {
      const data = await bookingService.getBookingById(numericId);
      if (data) {
        setBooking(data);
      } else {
        toast.error('Booking not found');
      }
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleCancelBooking = async (reason: string) => {
    try {
      await bookingService.cancelBooking(numericId, { reason });
      toast.success('Booking cancelled successfully');
      await fetchBooking();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to cancel booking';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-28">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card bg-base-100 border border-base-300 p-8 text-center space-y-4 max-w-md mx-auto mt-12">
        <FaBan className="size-10 text-error mx-auto" />
        <h2 className="text-xl font-bold">Booking Not Found</h2>
        <p className="text-sm text-base-content/60">
          The requested reservation #{id} does not exist or was deleted.
        </p>
        <Link to="/bookings" className="btn btn-primary btn-sm">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const isCancelled = booking.status === 'cancelled';
  const dateFormatted = formatDate(booking.slotStart);
  const timeFormatted = formatSlotRange(booking.slotStart, booking.slotEnd, true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/bookings"
              className="btn btn-ghost btn-xs gap-1 text-base-content/60 hover:text-base-content"
            >
              <FaArrowLeft className="size-3" /> Back to Bookings
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Booking #{booking.id}
            </h1>
            <span
              className={`badge badge-sm font-bold uppercase ${
                isCancelled ? 'badge-error' : 'badge-success'
              }`}
            >
              {isCancelled ? 'Cancelled' : 'Confirmed'}
            </span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            Booked on {formatDate(booking.createdAt)}
          </p>
        </div>

        {!isCancelled && (
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="btn btn-error btn-outline btn-sm gap-2"
          >
            <FaBan className="size-3.5" /> Cancel Booking
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Court & Schedule Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-base-300">
            <FaCalendarCheck className="size-4 text-primary" />
            <h2 className="font-bold text-base">Facility & Schedule</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <FaLocationDot className="size-4 text-base-content/40 mt-1 shrink-0" />
              <div>
                <span className="text-xs text-base-content/60 block">Court</span>
                <span className="font-bold text-base-content">{booking.courtName}</span>
                {booking.sport && (
                  <span className="badge badge-xs badge-outline uppercase ml-2 text-[10px]">
                    {booking.sport}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaClock className="size-4 text-base-content/40 mt-1 shrink-0" />
              <div>
                <span className="text-xs text-base-content/60 block">Date & Time</span>
                <span className="font-semibold text-base-content block">{dateFormatted}</span>
                <span className="font-mono text-xs text-primary font-bold">{timeFormatted}</span>
              </div>
            </div>
          </div>

          {/* Player details */}
          <div className="pt-3 border-t border-base-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                <FaUser className="size-3 text-primary" /> Player Information
              </span>
              <span className="badge badge-sm badge-outline uppercase font-semibold">
                {booking.bookingType === 'walk_in' ? 'WALK IN' : booking.bookingType.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {booking.bookingType === 'member' && (
              <div className="p-3 bg-base-200/50 rounded-xl flex items-center justify-between text-sm">
                <div>
                  <div className="font-bold">{booking.memberName || `Member #${booking.memberId}`}</div>
                  <div className="text-xs text-base-content/60">Club Member</div>
                </div>
                <span className="badge badge-primary badge-sm font-mono">#{booking.memberId}</span>
              </div>
            )}

            {booking.bookingType === 'walk_in' && (
              <div className="p-3 bg-base-200/50 rounded-xl text-sm space-y-1">
                <div className="font-bold">{booking.guestName}</div>
                <div className="text-xs text-base-content/60">
                  Phone: {booking.guestPhone || 'None specified'}
                </div>
              </div>
            )}

            {booking.bookingType === 'social' && (
              <div className="space-y-2">
                <div className="text-xs text-base-content/70 flex items-center gap-1.5 font-semibold">
                  <FaUsers className="size-3" /> Participants (
                  {booking.participants?.length || 0})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {booking.participants?.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-base-200/50 border border-base-300 text-xs"
                    >
                      <span className="font-semibold">
                        {p.memberName || p.guestName || `Member #${p.memberId}`}
                      </span>
                      <span className="text-[10px] text-base-content/50 block">
                        {p.memberId ? 'Club Member' : 'Guest'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="pt-3 border-t border-base-300 flex items-start gap-2 text-xs">
              <FaNoteSticky className="size-3.5 text-base-content/40 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-base-content/70">Notes:</span>
                <p className="text-base-content/80 mt-0.5">{booking.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment & Invoice Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-base-300">
            <FaCreditCard className="size-4 text-primary" />
            <h2 className="font-bold text-base">Payment Details</h2>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-base-200/50 border border-base-300 text-center">
              <span className="text-xs text-base-content/60 uppercase tracking-wide block">
                Total Paid
              </span>
              <div className="text-3xl font-black text-primary flex items-center justify-center gap-1 mt-1">
                <FaIndianRupeeSign className="size-5" />
                {(booking.amountPaidPaise / 100).toFixed(2)}
              </div>
              <span className="text-[11px] text-base-content/50 block mt-1">
                Calculated by tier rate
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-base-300">
                <span className="text-base-content/60">Method:</span>
                <span className="badge badge-sm badge-outline uppercase font-semibold">
                  {booking.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-300">
                <span className="text-base-content/60">Status:</span>
                <span className="text-success font-bold flex items-center gap-1">
                  <FaCheck className="size-2.5" /> Paid & Cleared
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-base-content/60">Ref:</span>
                <span className="font-mono">#BK-{booking.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingCancelModal
        isOpen={isCancelModalOpen}
        bookingId={booking.id}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelBooking}
      />
    </motion.div>
  );
};

export default BookingDetailPage;
