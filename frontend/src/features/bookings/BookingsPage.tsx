import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FaCalendarCheck } from 'react-icons/fa6';
import { mockBookings } from '@/mock';
import type { Booking } from '@/types';
import { BookingsTable } from './components';

export const BookingsPage: React.FC = () => {
  const [bookings] = useState<Booking[]>(mockBookings);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <FaCalendarCheck className="size-7 text-primary" /> Bookings & Court Slots
        </h1>
        <p className="text-sm text-base-content/70 mt-1">
          Master calendar and reservation list for all club facilities.
        </p>
      </div>

      <BookingsTable bookings={bookings} />
    </motion.div>
  );
};

export default BookingsPage;
