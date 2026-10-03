import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { FaPlus, FaUsers } from 'react-icons/fa6';
import {
  KpiStatsGrid,
  SystemPulseCard,
  FacilityOccupancyGrid,
  EquipmentStatusCard,
  RecentBookingsTable,
} from './components';

export const DashboardPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Club Overview & Operations
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Real-time status of sports facilities, active members, court schedules, and equipment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/facilities" className="btn btn-primary btn-sm sm:btn-md gap-2 shadow-sm">
            <FaPlus className="size-3.5" /> Book Court
          </Link>
          <Link to="/members" className="btn btn-outline btn-sm sm:btn-md gap-2">
            <FaUsers className="size-3.5" /> New Member
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <KpiStatsGrid />

      {/* Newton's Cradle Live Pulse Display */}
      <SystemPulseCard />

      {/* Main Content Sections: Court Availability & Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FacilityOccupancyGrid />
        </div>
        <div>
          <EquipmentStatusCard />
        </div>
      </div>

      {/* Recent Bookings Table */}
      <RecentBookingsTable />
    </motion.div>
  );
};

export default DashboardPage;
