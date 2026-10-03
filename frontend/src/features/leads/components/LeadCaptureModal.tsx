import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrophy, FaPaperPlane } from 'react-icons/fa6';
import { Modal, Button, Input, TextArea } from '@/components/ui';
import type { CreateLeadPayload } from '@/types/leads';

const leadCaptureSchema = z.object({
  name: z.string().min(2, 'Name is required (min 2 chars)'),
  email: z.string().email('Please enter a valid email address').or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  sport: z.string().min(1, 'Please select a sport / facility'),
  message: z.string().optional(),
});

type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>;

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadPayload) => Promise<void>;
}

export const LeadCaptureModal = ({
  isOpen,
  onClose,
  onSubmit,
}: LeadCaptureModalProps) => {
  // Forms: React Hook Form + Zod (mode: 'onTouched'). Fields start empty, no mock autofill.
  // Strict rule: Phone 10 digits regex (^\d{10}$)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      sport: 'tennis',
      message: '',
    },
  });

  const handleFormSubmit = async (data: LeadCaptureFormData) => {
    await onSubmit({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone,
      sport: data.sport,
      message: data.message || undefined,
      source: 'walk_in',
    });
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaTrophy className="size-5 text-amber-500" /> Capture New CRM Lead
        </span>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Prospect Name"
          placeholder="e.g. Anand Varma"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number (10 digits)"
            type="tel"
            maxLength={10}
            placeholder="9825012345"
            {...register('phone')}
            error={errors.phone?.message}
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="prospect@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div className="fieldset">
          <label className="fieldset-label font-medium text-xs text-base-content/80">
            Sport / Interest
          </label>
          <select {...register('sport')} className="select select-bordered w-full text-sm">
            <option value="tennis">Tennis (Courts & Coaching)</option>
            <option value="cricket">Cricket (Turf Nets & Bowling Machine)</option>
            <option value="badminton">Badminton</option>
            <option value="squash">Squash</option>
            <option value="gym">Gym & Wellness</option>
          </select>
          {errors.sport && (
            <span className="text-error text-xs mt-1">{errors.sport.message}</span>
          )}
        </div>

        <TextArea
          label="Enquiry Details / Requirements"
          placeholder="Details on requirements, preferred timings, trial session..."
          rows={3}
          {...register('message')}
          error={errors.message?.message}
        />

        <div className="modal-action pt-4 border-t border-base-300">
          <Button type="button" variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<FaPaperPlane className="size-3.5" />}
          >
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
