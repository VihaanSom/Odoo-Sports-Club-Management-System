import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaArrowRight,
  FaCheck,
  FaLocationDot,
  FaShieldHalved,
} from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { publicService } from '@/services/publicService';
import type { PublicPlan, PublicFacilityInfo } from '@/types/public';

export const PublicLandingPage = () => {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [facilities, setFacilities] = useState<PublicFacilityInfo[]>([]);

  useEffect(() => {
    const fetchLandingData = async () => {
      const [plansData, facData] = await Promise.all([
        publicService.getPublicPlans(),
        publicService.getPublicFacilities(),
      ]);
      setPlans(plansData);
      setFacilities(facData);
    };
    fetchLandingData();
  }, []);

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wide"
        >
          <FaTrophy className="size-3.5 text-amber-500" />
          <span>Gujarat's Premier Private Athletic Club</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto text-base-content leading-tight"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          The Pinnacle of <span className="text-primary underline decoration-amber-500 underline-offset-8">Athletic Excellence</span> in Ahmedabad.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-base-content/75 max-w-2xl mx-auto"
        >
          12 international competition courts, Roland-Garros specification red clay, Olympic 50-meter swimming, and elite performance coaching.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Link to="/public/trial">
            <Button size="md" variant="primary" rightIcon={<FaArrowRight />}>
              Book Trial
            </Button>
          </Link>
          <Link to="/public/plans">
            <Button size="md" variant="outline">
              View Plans
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* KPI Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-base-200/70 border border-base-300 shadow-sm text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-primary font-mono">520+</div>
            <div className="text-xs uppercase font-semibold text-base-content/70 mt-1">Active Members</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-500 font-mono">12 Courts</div>
            <div className="text-xs uppercase font-semibold text-base-content/70 mt-1">Olympic Facilities</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-primary font-mono">15 Masters</div>
            <div className="text-xs uppercase font-semibold text-base-content/70 mt-1">Certified Coaches</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-success font-mono">99.4%</div>
            <div className="text-xs uppercase font-semibold text-base-content/70 mt-1">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Featured Facilities Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">World-Class Facilities</h2>
            <p className="text-sm text-base-content/70 mt-1">
              Precision surfaces built to international federation standards.
            </p>
          </div>
          <Link to="/public/facilities">
            <Button variant="ghost" size="sm" rightIcon={<FaArrowRight />}>
              Explore All Courts
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {facilities.slice(0, 3).map((fac) => (
            <div
              key={fac.id}
              className="card bg-base-100 border border-base-300 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <figure className="relative h-48">
                <img
                  src={fac.imageUrl}
                  alt={fac.name}
                  className="w-full h-full object-cover"
                />
                <span className="badge badge-primary absolute top-3 right-3 text-xs font-semibold">
                  {fac.sport}
                </span>
              </figure>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base">{fac.name}</h3>
                  <span className="font-mono text-xs font-bold text-primary">
                    ₹{(fac.hourlyRatePaise / 100).toLocaleString('en-IN')}/hr
                  </span>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">{fac.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {fac.specs.slice(0, 2).map((sp) => (
                    <span key={sp} className="badge badge-outline badge-xs text-[10px]">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Membership Plans Snapshot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Membership Tiers</h2>
          <p className="text-sm text-base-content/70">
            Tailored memberships designed for competitive champions and active families.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card bg-base-100 border p-5 shadow-xs flex flex-col justify-between ${
                plan.isPopular ? 'border-primary ring-2 ring-primary/20' : 'border-base-300'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 font-mono">
                    {plan.tier}
                  </span>
                  {plan.badge && (
                    <span className="badge badge-primary badge-xs font-semibold">{plan.badge}</span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="mt-2 font-mono">
                    <span className="text-2xl font-black">
                      ₹{(plan.pricePaise / 100).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-base-content/60"> / {plan.billingPeriod}</span>
                  </div>
                </div>

                <p className="text-xs text-base-content/70">{plan.description}</p>

                <div className="divider my-1" />

                <ul className="space-y-2 text-xs">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <FaCheck className="size-3 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link to="/public/trial">
                  <Button
                    size="sm"
                    variant={plan.isPopular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    Select Plan
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Location Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-base-200/80 border border-base-300 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              <FaShieldHalved className="text-primary" /> Certified Elite Club Atmosphere
            </h3>
            <p className="text-xs text-base-content/70 max-w-xl">
              Equipped with medical physiotherapy rooms, sauna, high-protein bistro, pro stringing machines, and 24/7 biometric member security.
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/public/contact">
              <Button size="sm" variant="outline" leftIcon={<FaLocationDot />}>
                Visit Club
              </Button>
            </Link>
            <Link to="/public/trial">
              <Button size="sm" variant="primary">
                Book Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicLandingPage;
