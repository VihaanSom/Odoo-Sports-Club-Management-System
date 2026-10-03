import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaBuilding, FaArrowRight } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { publicService } from '@/services/publicService';
import type { PublicFacilityInfo } from '@/types/public';

export const PublicFacilitiesPage = () => {
  const [facilities, setFacilities] = useState<PublicFacilityInfo[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFac = async () => {
      setLoading(true);
      try {
        const data = await publicService.getPublicFacilities();
        setFacilities(data);
      } finally {
        setLoading(false);
      }
    };
    fetchFac();
  }, []);

  const sportsList = ['all', 'Tennis', 'Badminton', 'Squash', 'Swimming', 'Gym'];

  const filtered = selectedSport === 'all'
    ? facilities
    : facilities.filter((f) => f.sport.toLowerCase() === selectedSport.toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            <FaBuilding className="size-8 text-primary" /> Olympic Facilities & Courts
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Explore international competition surfaces, synthetic courts, and Olympic amenities.
          </p>
        </div>

        {/* Sport Filters */}
        <div className="flex flex-wrap gap-1.5">
          {sportsList.map((sport) => (
            <button
              key={sport}
              type="button"
              className={`btn btn-xs capitalize ${
                selectedSport === sport ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => setSelectedSport(sport)}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((fac) => (
            <div
              key={fac.id}
              className="card bg-base-100 border border-base-300 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <figure className="relative h-52">
                  <img
                    src={fac.imageUrl}
                    alt={fac.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge badge-neutral text-xs font-mono font-bold">
                      {fac.courtNumber}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-primary text-xs font-semibold">
                      {fac.sport}
                    </span>
                  </div>
                </figure>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-snug">{fac.name}</h3>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-primary">
                        ₹{(fac.hourlyRatePaise / 100).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-base-content/50">per hour</div>
                    </div>
                  </div>

                  <p className="text-xs text-base-content/70 leading-relaxed">
                    {fac.description}
                  </p>

                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider mb-1.5">
                      Specifications
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {fac.specs.map((sp) => (
                        <span key={sp} className="badge badge-outline badge-xs text-[10px]">
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link to={`/public/slots?sport=${fac.sport.toLowerCase()}`}>
                  <Button size="xs" variant="primary" className="w-full" rightIcon={<FaArrowRight />}>
                    Check Available Slots
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PublicFacilitiesPage;
