import React from 'react';
import { FaCalendarDays, FaClock, FaUser } from 'react-icons/fa6';
import { Badge } from '@/components/ui';
import type { Booking } from '@/types';

interface BookingsTableProps {
  bookings: Booking[];
}

export const BookingsTable: React.FC<BookingsTableProps> = ({ bookings }) => {
  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-sm">
          <thead>
            <tr className="bg-base-300/40">
              <th>Booking Ref</th>
              <th>Facility</th>
              <th>Member</th>
              <th>Schedule</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-base-300/30">
                <td className="font-mono text-xs font-bold text-primary">{b.id}</td>
                <td className="font-semibold">{b.facilityName}</td>
                <td>
                  <span className="flex items-center gap-1.5">
                    <FaUser className="size-3 text-base-content/50" />
                    {b.memberName}
                  </span>
                </td>
                <td>
                  <div className="flex flex-col text-xs">
                    <span className="font-medium flex items-center gap-1">
                      <FaClock className="size-3 text-base-content/50" />
                      {b.startTime} - {b.endTime}
                    </span>
                    <span className="text-base-content/60 flex items-center gap-1">
                      <FaCalendarDays className="size-3 text-base-content/40" />
                      {b.date}
                    </span>
                  </div>
                </td>
                <td>
                  <Badge
                    size="sm"
                    variant={
                      b.status === 'confirmed'
                        ? 'success'
                        : b.status === 'in_progress'
                        ? 'warning'
                        : b.status === 'upcoming'
                        ? 'info'
                        : 'neutral'
                    }
                    className="capitalize font-semibold"
                  >
                    {b.status.replace('_', ' ')}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
