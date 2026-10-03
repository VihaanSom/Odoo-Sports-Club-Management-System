import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { FaEnvelope, FaLocationDot, FaPhone, FaClock, FaCircleCheck } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { publicService } from '@/services/publicService';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Name required (min 2 chars)'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  sportInterest: z.string().min(1, 'Select sport interest'),
  state: z.string().min(1, 'Select state'),
  preferredTime: z.string().optional(),
  message: z.string().min(5, 'Message required (min 5 chars)'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const PublicContactPage = () => {
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      sportInterest: 'Tennis',
      state: 'Gujarat',
      preferredTime: 'Morning (06:00 - 10:00)',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await publicService.submitContactInquiry(data);
      setSubmittedId(res.id);
      toast.success('Inquiry submitted successfully');
      reset();
    } catch {
      toast.error('Submission failed. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
    >
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Contact Champions Club</h1>
        <p className="text-sm text-base-content/75">
          Schedule private tours, inquire about corporate memberships, or connect with our coaching directors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="card bg-base-100 border border-base-300 p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-bold">Club Headquarters</h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <FaLocationDot className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-base-content">Campus Address</div>
                <p className="text-base-content/70 mt-0.5">
                  Opposite SG Highway Pavilion, Bodakdev, Ahmedabad, Gujarat 380054
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaPhone className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-base-content">Direct Concierge</div>
                <p className="text-base-content/70 mt-0.5">+91 79 4000 8888 / +91 98250 11223</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaEnvelope className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-base-content">Email Inquiries</div>
                <p className="text-base-content/70 mt-0.5">desk@championsclub.in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaClock className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-base-content">Facility Hours</div>
                <p className="text-base-content/70 mt-0.5">Daily 05:30 AM - 11:00 PM</p>
              </div>
            </div>
          </div>

          <div className="divider my-1" />

          <div className="p-4 rounded-lg bg-base-200/60 border border-base-300 text-xs text-base-content/70 space-y-1">
            <div className="font-bold text-base-content">Valet Parking Available</div>
            <p>Dedicated multi-level member parking at Gate 2 on Bodakdev road.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-300 p-6 sm:p-8 shadow-xs">
          {submittedId ? (
            <div className="text-center py-12 space-y-4">
              <div className="size-14 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
                <FaCircleCheck className="size-8" />
              </div>
              <h3 className="text-2xl font-bold">Inquiry Received</h3>
              <p className="text-xs text-base-content/70 max-w-md mx-auto">
                Thank you for contacting Champions Club. Your reference ID is{' '}
                <span className="font-mono font-bold text-primary">{submittedId}</span>. A membership advisor will get in touch within 4 business hours.
              </p>
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={() => setSubmittedId(null)}>
                  Submit Another Inquiry
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h2 className="text-xl font-bold">Send Inquiry</h2>

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
                    <span className="label-text font-medium text-xs">Sport of Interest *</span>
                  </label>
                  <select
                    className="select select-bordered w-full select-sm text-xs"
                    {...register('sportInterest')}
                  >
                    <option value="Tennis">Tennis (Clay / Hard)</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Squash">Squash</option>
                    <option value="Swimming">Olympic Swimming</option>
                    <option value="Gym">Athletic Gym & Conditioning</option>
                    <option value="All-Sports">All-Club Access</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium text-xs">State *</span>
                  </label>
                  <select
                    className="select select-bordered w-full select-sm text-xs"
                    {...register('state')}
                  >
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium text-xs">Preferred Contact Time</span>
                  </label>
                  <select
                    className="select select-bordered w-full select-sm text-xs"
                    {...register('preferredTime')}
                  >
                    <option value="Morning (06:00 - 10:00)">Morning (06:00 - 10:00)</option>
                    <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                    <option value="Evening (17:00 - 21:00)">Evening (17:00 - 21:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium text-xs">Your Message *</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="How can we assist you with membership, court access, or academy coaching?"
                  className={`textarea textarea-bordered w-full text-xs ${errors.message ? 'textarea-error' : ''}`}
                  {...register('message')}
                />
                {errors.message && (
                  <span className="text-xs text-error mt-1">{errors.message.message}</span>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Submit
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PublicContactPage;
