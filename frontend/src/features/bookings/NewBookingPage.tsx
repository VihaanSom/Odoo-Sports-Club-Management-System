import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaCalendarPlus, FaArrowLeft, FaCalendarDays } from 'react-icons/fa6';
import { BookingWizard } from './components/BookingWizard';

export const NewBookingPage = () => {
  const [searchParams] = useSearchParams();
  const courtId = searchParams.get('courtId')
    ? parseInt(searchParams.get('courtId')!, 10)
    : undefined;
  const slotStart = searchParams.get('slotStart') || undefined;
  const slotEnd = searchParams.get('slotEnd') || undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaCalendarPlus className="size-7 text-primary" /> New Court Reservation
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Reserve courts for club members, walk-in guests, or social play.
          </p>
        </div>

        <Link to="/bookings/calendar" className="btn btn-outline btn-sm gap-2">
          <FaCalendarDays className="size-3.5" /> Check Schedule Matrix
        </Link>
      </div>

      <BookingWizard
        initialCourtId={courtId}
        initialSlotStart={slotStart}
        initialSlotEnd={slotEnd}
      />
    </motion.div>
  );
};

export default NewBookingPage;
