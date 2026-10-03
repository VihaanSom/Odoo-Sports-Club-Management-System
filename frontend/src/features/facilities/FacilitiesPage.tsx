import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaBasketball, FaGear, FaPlus } from 'react-icons/fa6';
import { courtService } from '@/services/courtService';
import type { Court } from '@/types/courts';
import type { Facility } from '@/types';
import { FacilityCard, FacilityFilterBar } from './components';

export const FacilitiesPage = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const sportsFilter = ['All', 'Tennis', 'Cricket'];

  const fetchCourts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courtService.getCourts();
      setCourts(data);
    } catch {
      toast.error('Failed to load courts from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const facilities: Facility[] = courts.map((c) => {
    const isTennis = c.sport.toLowerCase() === 'tennis';
    return {
      id: c.id,
      name: c.name,
      sport: isTennis ? 'Tennis' : 'Cricket',
      courtNumber: `#${c.id}`,
      status: c.isActive ? 'available' : 'maintenance',
      hourlyRate: isTennis ? 250 : 400,
      imageUrl: isTennis
        ? 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500'
        : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500',
    };
  });

  const filtered = facilities.filter(
    (f) => selectedSport === 'All' || f.sport.toLowerCase() === selectedSport.toLowerCase()
  );

  const handleBook = (facility: Facility) => {
    navigate(`/bookings/new?courtId=${facility.id}`);
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
            Browse available sport venues, view hourly tariffs, and book live court sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/facilities/management" className="btn btn-outline btn-sm gap-1.5">
            <FaGear className="size-3.5" /> Court Operations
          </Link>
          <Link to="/bookings/new" className="btn btn-primary btn-sm gap-1.5 font-bold">
            <FaPlus className="size-3.5" /> Book Court
          </Link>
        </div>
      </div>

      {/* Sport Category Filters */}
      <FacilityFilterBar
        sports={sportsFilter}
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
      />

      {/* Facility Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-12 text-center text-base-content/60">
          No sports facilities found matching selected category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FacilitiesPage;
