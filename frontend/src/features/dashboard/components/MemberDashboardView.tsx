import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaTrophy,
  FaUtensils,
  FaDumbbell,
  FaIdCard,
  FaClock,
  FaCircleCheck,
  FaArrowRight,
  FaShieldHalved,
  FaLocationDot,
} from 'react-icons/fa6';
import { useAuthStore } from '@/stores/authStore';
import { bookingService } from '@/services/bookingService';
import { courtService } from '@/services/courtService';
import type { BookingDetail } from '@/types/bookings';
import type { Court } from '@/types/courts';
import { MEMBERSHIP_TIERS } from '@/types/auth';
import { formatDate, formatSlotRange } from '@/lib/utils';

export const MemberDashboardView = () => {
  const user = useAuthStore((s) => s.user);
  const [myBookings, setMyBookings] = useState<BookingDetail[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  const tier = user?.tier || 'Gold';
  const tierInfo = MEMBERSHIP_TIERS.find(
    (t) => t.id.toLowerCase() === tier.toLowerCase()
  ) || MEMBERSHIP_TIERS[0];

  useEffect(() => {
    const loadMemberData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, courtsRes] = await Promise.all([
          bookingService.getBookings({
            memberId: user?.id,
            status: 'confirmed',
          }),
          courtService.getCourts(),
        ]);
        setMyBookings(bookingsRes.data || []);
        setCourts(courtsRes || []);
      } catch (err) {
        console.error('Failed to load member dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadMemberData();
    }
  }, [user?.id]);

  const activeCourts = courts.filter((c) => c.isActive);
  const upcomingBookings = myBookings.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-base-100 to-base-200 border border-base-300 shadow-sm p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary font-bold text-xs uppercase tracking-wider">
                {tier} Member
              </span>
              <span className="text-xs text-base-content/50 font-mono">
                ID #{user?.id || '---'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              Welcome back, {user?.firstName || user?.name || 'Member'}!
            </h1>
            <p className="text-sm text-base-content/65">
              Enjoy your club privileges, book courts, and browse member amenities.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/bookings/calendar"
              className="btn btn-primary btn-sm gap-2 font-bold shadow-sm"
            >
              <FaCalendarCheck className="size-4" /> Book a Court
            </Link>
            <Link
              to="/facilities"
              className="btn btn-outline btn-sm gap-2"
            >
              <FaTrophy className="size-4" /> Explore Courts
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/bookings/calendar"
          className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FaCalendarCheck className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
            Court Booking
          </h3>
          <p className="text-xs text-base-content/60 mt-1">
            Check real-time slot availability & reserve
          </p>
        </Link>

        <Link
          to="/facilities"
          className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FaTrophy className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
            Courts & Facilities
          </h3>
          <p className="text-xs text-base-content/60 mt-1">
            Tennis clay & hard courts, cricket nets
          </p>
        </Link>

        <Link
          to="/menu"
          className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FaUtensils className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
            F&B Menu
          </h3>
          <p className="text-xs text-base-content/60 mt-1">
            Cafe & bistro drinks, snacks, and meals
          </p>
        </Link>

        <Link
          to="/equipment"
          className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FaDumbbell className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
            Pro Shop Store
          </h3>
          <p className="text-xs text-base-content/60 mt-1">
            Rackets, balls, apparel, and rentals
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Upcoming Reservations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-base-300">
              <div className="flex items-center gap-2">
                <FaCalendarCheck className="size-4 text-primary" />
                <h3 className="font-bold text-sm text-base-content">
                  My Active Reservations
                </h3>
              </div>
              <Link
                to="/bookings/calendar"
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Book New Slot <FaArrowRight className="size-2.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <span className="loading loading-spinner loading-md text-primary" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-xs text-base-content/60">
                  You have no active court reservations scheduled.
                </p>
                <Link
                  to="/bookings/calendar"
                  className="btn btn-outline btn-xs btn-primary gap-1 font-semibold"
                >
                  <FaCalendarCheck className="size-3" /> Book Available Slot
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-base-200 mt-2">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-base-content">
                        {b.courtName || `Court #${b.courtId}`}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-base-content/60 font-mono">
                        <span className="flex items-center gap-1">
                          <FaClock className="size-2.5 text-primary" />
                          {formatSlotRange(b.slotStart, b.slotEnd)}
                        </span>
                        <span>{formatDate(b.slotStart)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="badge badge-success badge-xs font-semibold">
                        Confirmed
                      </span>
                      <Link
                        to={`/bookings/${b.id}`}
                        className="btn btn-ghost btn-xs text-primary"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Facilities Status */}
          <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-base-300">
              <div className="flex items-center gap-2">
                <FaLocationDot className="size-4 text-primary" />
                <h3 className="font-bold text-sm text-base-content">
                  Live Court Availability
                </h3>
              </div>
              <span className="text-xs text-base-content/60">
                {activeCourts.length} active courts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="p-3 rounded-xl border border-base-300 bg-base-200/30 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-base-content">
                      {court.name}
                    </div>
                    <div className="text-[11px] text-base-content/60 uppercase font-mono mt-0.5">
                      {court.sport} &bull; {court.openTime} - {court.closeTime}
                    </div>
                  </div>
                  <Link
                    to={`/bookings/calendar`}
                    className="btn btn-xs btn-outline btn-primary"
                  >
                    View Slots
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Member Tier Perks (1 col) */}
        <div className="space-y-6">
          <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-base-300">
              <div className="flex items-center gap-2">
                <FaShieldHalved className="size-4 text-primary" />
                <h3 className="font-bold text-sm text-base-content">
                  {tier} Member Privileges
                </h3>
              </div>
              <span className={`badge badge-sm ${tierInfo.badgeColor} font-bold`}>
                {tierInfo.badge}
              </span>
            </div>

            <p className="text-xs text-base-content/70 leading-relaxed">
              {tierInfo.description}
            </p>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50 block">
                Included Benefits
              </span>
              <ul className="space-y-2">
                {tierInfo.perks.map((perk, idx) => (
                  <li
                    key={idx}
                    className="text-xs flex items-start gap-2 text-base-content/85"
                  >
                    <FaCircleCheck className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-base-300">
              <Link
                to="/memberships"
                className="btn btn-outline btn-sm w-full gap-2 text-xs"
              >
                <FaIdCard className="size-3.5" /> View All Membership Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemberDashboardView;
