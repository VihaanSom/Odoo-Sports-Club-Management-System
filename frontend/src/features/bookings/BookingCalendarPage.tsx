import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaCalendarDays, FaPlus, FaListUl, FaArrowLeft } from 'react-icons/fa6';
import { useAuthStore } from '@/stores/authStore';
import { canManageBookings } from '@/lib/permissions';
import { CourtAvailabilityMatrix } from './components/CourtAvailabilityMatrix';

export const BookingCalendarPage = () => {
  const user = useAuthStore((s) => s.user);
  const canManage = canManageBookings(user?.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {canManage && (
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/bookings"
                className="btn btn-ghost btn-xs gap-1 text-base-content/60 hover:text-base-content"
              >
                <FaArrowLeft className="size-3" /> Back to Bookings List
              </Link>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaCalendarDays className="size-7 text-primary" /> Court Schedule & Matrix
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            {canManage
              ? 'Real-time court grid with hourly slot occupancy across sports.'
              : 'View live court availability across sports and reserve open time slots.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Link to="/bookings" className="btn btn-ghost btn-sm gap-1.5">
              <FaListUl className="size-3.5" /> List View
            </Link>
          )}
          <Link to="/bookings/new" className="btn btn-primary btn-sm gap-2">
            <FaPlus className="size-3.5" /> Book Court
          </Link>
        </div>
      </div>

      {/* Full interactive availability matrix */}
      <CourtAvailabilityMatrix />
    </motion.div>
  );
};

export default BookingCalendarPage;
