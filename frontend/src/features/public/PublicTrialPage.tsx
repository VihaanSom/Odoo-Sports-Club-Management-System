import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { FaTrophy, FaTicket, FaCheck } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button, DatePicker } from '@/components/ui';
import { publicService } from '@/services/publicService';

const trialSchema = z.object({
  fullName: z.string().min(2, 'Name required (min 2 chars)'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  date: z.string().min(1, 'Please select a trial date'),
});

type TrialFormData = z.infer<typeof trialSchema>;

export const PublicTrialPage = () => {
  const [passData, setPassData] = useState<{
    passCode: string;
    fullName: string;
    phone: string;
    date: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrialFormData>({
    resolver: zodResolver(trialSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: TrialFormData) => {
    try {
      const res = await publicService.submitTrialBooking({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        preferredDate: data.date,
      });
      setPassData({
        passCode: res.passCode,
        fullName: data.fullName,
        phone: data.phone,
        date: data.date,
      });
      toast.success(res.message || '1-Day Pass issued successfully');
      reset();
    } catch {
      toast.error('Pass registration failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <FaTrophy className="size-3 text-amber-500" />
          <span>Complimentary Pass</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Claim 1-Day Club Experience Pass
        </h1>
        <p className="text-sm text-base-content/75 max-w-xl mx-auto">
          Test-drive our international competition courts, Olympic pool, and locker amenities without any commitment.
        </p>
      </div>

      {passData ? (
        <div className="card bg-base-100 border border-primary/40 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-base-300 pb-4">
            <div className="flex items-center gap-2">
              <FaTrophy className="size-6 text-amber-500" />
              <div>
                <span className="font-black text-lg uppercase tracking-tight">Champions Club</span>
                <span className="block text-[10px] text-base-content/50 uppercase font-bold tracking-widest">
                  Official Guest Pass
                </span>
              </div>
            </div>
            <span className="badge badge-success font-bold text-xs uppercase px-3 py-2">
              Pass Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-base-200/60 rounded-lg">
              <span className="text-base-content/60 block text-[10px] uppercase font-bold">
                Guest Name
              </span>
              <span className="text-base font-bold text-base-content mt-1 block">
                {passData.fullName}
              </span>
            </div>

            <div className="p-3 bg-base-200/60 rounded-lg">
              <span className="text-base-content/60 block text-[10px] uppercase font-bold">
                Contact Phone
              </span>
              <span className="text-base font-bold text-primary mt-1 block font-mono">
                {passData.phone}
              </span>
            </div>

            <div className="p-3 bg-base-200/60 rounded-lg">
              <span className="text-base-content/60 block text-[10px] uppercase font-bold">
                Visit Date
              </span>
              <span className="text-base font-bold text-base-content mt-1 block font-mono">
                {passData.date}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
            <div className="text-[11px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
              Concierge Verification Code
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-base-content tracking-widest">
              {passData.passCode}
            </div>
          </div>

          <div className="space-y-2 text-xs text-base-content/70">
            <div className="flex items-center gap-2">
              <FaCheck className="size-3 text-success shrink-0" />
              <span>Present this pass or code at the Front Desk Concierge (Gate 1).</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheck className="size-3 text-success shrink-0" />
              <span>Complimentary demo racket & court towel included for your session.</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheck className="size-3 text-success shrink-0" />
              <span>Valid for 1 full club session on specified date.</span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Button size="sm" variant="outline" onClick={() => setPassData(null)}>
              Claim Another Pass
            </Button>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium text-xs">Full Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className={`input input-bordered w-full input-sm ${errors.fullName ? 'input-error' : ''}`}
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <span className="text-xs text-error mt-1">{errors.fullName.message}</span>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium text-xs">Email Address *</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`input input-bordered w-full input-sm ${errors.email ? 'input-error' : ''}`}
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-xs text-error mt-1">{errors.email.message}</span>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium text-xs">Phone Number *</span>
                </label>
                <input
                  type="text"
                  placeholder="+91 98250 00000"
                  className={`input input-bordered w-full input-sm ${errors.phone ? 'input-error' : ''}`}
                  {...register('phone')}
                />
                {errors.phone && (
                  <span className="text-xs text-error mt-1">{errors.phone.message}</span>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium text-xs">Preferred Date *</span>
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      size="sm"
                      placeholder="Select visit date"
                      minDate={new Date().toISOString().split('T')[0]}
                      error={errors.date?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<FaTicket />}
                isLoading={isSubmitting}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default PublicTrialPage;
