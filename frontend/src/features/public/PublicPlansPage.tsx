import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaCheck, FaTrophy, FaArrowRight, FaQuestion } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { publicService } from '@/services/publicService';
import type { PublicPlan } from '@/types/public';

export const PublicPlansPage = () => {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const data = await publicService.getPublicPlans();
        setPlans(data);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const checkIsActivePlan = (plan: PublicPlan) => {
    if (!user || user.role !== 'member') return false;

    // Determine plan duration in months
    const planDuration =
      plan.durationMonths ??
      (plan.billingPeriod === 'year' ? 12 : parseInt(plan.billingPeriod, 10) || 12);

    // Determine user's active duration
    let userDuration = (user as any).durationMonths ?? (user as any).duration;
    if (!userDuration && user.membershipStart && user.membershipEnd) {
      const start = new Date(user.membershipStart);
      const end = new Date(user.membershipEnd);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.4375));
      if (diff > 0) userDuration = diff;
    }

    // Direct planId match
    if (user.planId && String(user.planId) === String(plan.id)) {
      return true;
    }

    // Match BOTH plan name/tier AND duration
    const userPlanName = ((user as any).planName || user.tier || '').toLowerCase();
    const pName = (plan.name || '').toLowerCase();
    const pTier = (plan.tier || '').toLowerCase();

    const nameMatch = userPlanName ? pName.includes(userPlanName) || pTier === userPlanName : false;
    const durationMatch = userDuration ? Math.abs(planDuration - userDuration) <= 1 : true;

    return Boolean(nameMatch && durationMatch);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12"
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <FaTrophy className="size-3 text-amber-500" />
          <span>Membership Tiers</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Transparent, All-Inclusive Club Memberships
        </h1>
        <p className="text-sm sm:text-base text-base-content/75">
          Join Gujarat’s premier community of competitive athletes and sports families.
        </p>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => {
            const isActive = checkIsActivePlan(p);

            return (
              <div
                key={p.id}
                className={`card bg-base-100 border p-6 shadow-xs flex flex-col justify-between relative ${
                  isActive
                    ? 'border-success ring-2 ring-success/30 shadow-md bg-success/5'
                    : p.isPopular
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-base-300'
                }`}
              >
                {isActive ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-success font-bold text-xs uppercase px-3 py-2 shadow-xs">
                      Active Plan
                    </span>
                  </div>
                ) : p.isPopular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-primary font-bold text-xs uppercase px-3 py-2 shadow-xs">
                      Most Popular
                    </span>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-mono tracking-widest text-base-content/60 font-semibold">
                      {p.tier} Tier
                    </span>
                    {isActive ? (
                      <span className="badge badge-success badge-xs font-bold">Your Active Plan</span>
                    ) : p.badge && !p.isPopular ? (
                      <span className="badge badge-outline badge-xs">{p.badge}</span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <div className="mt-3 font-mono">
                      <span className="text-3xl font-black">
                        ₹{(p.pricePaise / 100).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-base-content/60"> / {p.billingPeriod}</span>
                    </div>
                  </div>

                  <p className="text-xs text-base-content/70">{p.description}</p>

                  <div className="divider my-1" />

                  <ul className="space-y-2.5 text-xs">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <FaCheck className="size-3 text-success shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-success text-success pointer-events-none font-bold"
                    >
                      Active Plan (Current)
                    </Button>
                  ) : (
                    <Link to="/public/trial">
                      <Button
                        size="sm"
                        variant={p.isPopular ? 'primary' : 'outline'}
                        className="w-full"
                        rightIcon={<FaArrowRight />}
                      >
                        Select Plan
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto pt-8 border-t border-base-300 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <FaQuestion className="text-primary text-lg" /> Frequently Asked Questions
          </h2>
          <p className="text-xs text-base-content/70 mt-1">
            Rules, guest entry, and court reservation policies.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="collapse collapse-plus bg-base-200/50 border border-base-300 rounded-lg">
            <input type="radio" name="faq-accordion" defaultChecked />
            <div className="collapse-title font-semibold text-sm">
              Can I bring guests to the club?
            </div>
            <div className="collapse-content text-base-content/70">
              <p>
                Yes. Premium members receive 4 complimentary guest day passes per month. VIP members have unlimited accompanied guest privileges. Additional guest court passes are ₹350 per session.
              </p>
            </div>
          </div>

          <div className="collapse collapse-plus bg-base-200/50 border border-base-300 rounded-lg">
            <input type="radio" name="faq-accordion" />
            <div className="collapse-title font-semibold text-sm">
              How far in advance can I book tennis or squash courts?
            </div>
            <div className="collapse-content text-base-content/70">
              <p>
                Standard members can book up to 5 days ahead, while Premium and VIP members enjoy prime-time priority reservations 7 days in advance through the online portal.
              </p>
            </div>
          </div>

          <div className="collapse collapse-plus bg-base-200/50 border border-base-300 rounded-lg">
            <input type="radio" name="faq-accordion" />
            <div className="collapse-title font-semibold text-sm">
              Is equipment rental included in memberships?
            </div>
            <div className="collapse-content text-base-content/70">
              <p>
                Basic demo rackets and tournament shuttlecocks/balls are provided at no extra charge. High-performance racquets (Wilson Pro Staff, Yonex Astrox) are available at discounted member rental rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublicPlansPage;
