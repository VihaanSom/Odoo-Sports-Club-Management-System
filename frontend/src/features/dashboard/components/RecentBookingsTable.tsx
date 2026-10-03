import { Link } from 'react-router-dom';
import { FaVolleyball, FaBasketball, FaTableTennisPaddleBall, FaPersonSwimming } from 'react-icons/fa6';

const recentBookings = [
  {
    id: 'BK-1001',
    member: 'Roger Federer',
    sport: 'Tennis Court 1',
    icon: <FaVolleyball className="size-4 text-warning" />,
    time: '10:00 AM - 11:30 AM',
    status: 'In Progress',
    badgeClass: 'badge-warning',
  },
  {
    id: 'BK-1002',
    member: 'Michael Jordan',
    sport: 'Indoor Basketball Gym',
    icon: <FaBasketball className="size-4 text-orange-500" />,
    time: '11:00 AM - 01:00 PM',
    status: 'Confirmed',
    badgeClass: 'badge-success',
  },
  {
    id: 'BK-1003',
    member: 'Lin Dan',
    sport: 'Badminton Court 3',
    icon: <FaTableTennisPaddleBall className="size-4 text-info" />,
    time: '01:30 PM - 03:00 PM',
    status: 'Upcoming',
    badgeClass: 'badge-info',
  },
  {
    id: 'BK-1004',
    member: 'Michael Phelps',
    sport: 'Olympic Swimming Lane 4',
    icon: <FaPersonSwimming className="size-4 text-cyan-400" />,
    time: '03:00 PM - 04:30 PM',
    status: 'Upcoming',
    badgeClass: 'badge-info',
  },
];

export const RecentBookingsTable = () => {
  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="card-title text-lg font-bold">Today's Active Schedule</h2>
            <p className="text-xs text-base-content/60">Upcoming and current court reservations</p>
          </div>
          <Link to="/bookings" className="btn btn-ghost btn-sm text-primary">
            View All Bookings
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Member Name</th>
                <th>Facility / Court</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-base-300/40">
                  <td className="font-mono text-xs font-semibold text-primary">{b.id}</td>
                  <td className="font-medium">{b.member}</td>
                  <td>
                    <span className="flex items-center gap-2">
                      {b.icon}
                      {b.sport}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/80">{b.time}</td>
                  <td>
                    <span className={`badge badge-sm font-semibold ${b.badgeClass}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button type="button" className="btn btn-ghost btn-xs">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
