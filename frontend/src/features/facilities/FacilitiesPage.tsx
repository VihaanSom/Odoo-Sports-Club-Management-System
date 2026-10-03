import React, { useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaBasketball } from 'react-icons/fa6';
import { mockFacilities } from '@/mock';
import type { Facility } from '@/types';
import { FacilityCard, FacilityFilterBar } from './components';

export const FacilitiesPage: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const sportsFilter = ['All', 'Tennis', 'Badminton', 'Squash', 'Basketball', 'Swimming', 'Gym'];

  const filtered = mockFacilities.filter(
    (f) => selectedSport === 'All' || f.sport === selectedSport
  );

  const handleBook = (facility: Facility) => {
    toast.success(`Slot booked for ${facility.name}! Reservation synced with Odoo.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaBasketball className="size-7 text-primary" /> Courts & Facilities
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Browse available sport venues, view hourly tariffs, and manage instant member bookings.
          </p>
        </div>
      </div>

      {/* Sport Category Filters */}
      <FacilityFilterBar
        sports={sportsFilter}
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
      />

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            onBook={handleBook}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default FacilitiesPage;
