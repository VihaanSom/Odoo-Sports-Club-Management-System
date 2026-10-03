import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaPenToSquare, FaCircleCheck } from 'react-icons/fa6';
import { Modal, Button, Input } from '@/components/ui';
import type { MemberDetail, MemberUpdatePayload } from '@/types/members';

const memberEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  tier: z.enum(['Standard', 'Premium', 'VIP', 'Junior']),
  status: z.enum(['active', 'suspended', 'expired']),
});

type MemberEditFormData = z.infer<typeof memberEditSchema>;

interface MemberEditModalProps {
  isOpen: boolean;
  member: MemberDetail;
  onClose: () => void;
  onSubmit: (data: MemberUpdatePayload) => Promise<void>;
}

export const MemberEditModal = ({
  isOpen,
  member,
  onClose,
  onSubmit,
}: MemberEditModalProps) => {
  // Forms: React Hook Form + Zod (mode: 'onTouched').
  // Strict rule: Phone 10 digits regex (^\d{10}$)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberEditFormData>({
    resolver: zodResolver(memberEditSchema),
    mode: 'onTouched',
    defaultValues: {
      name: member.name || '',
      email: member.email || '',
      phone: member.phone?.replace(/\D/g, '').slice(-10) || '',
      tier: (member.tier as any) || 'Standard',
      status: (member.status as any) || 'active',
    },
  });

  const handleFormSubmit = async (data: MemberEditFormData) => {
    await onSubmit({
      name: data.name,
      email: data.email,
      phone: data.phone,
      tier: data.tier,
      status: data.status,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaPenToSquare className="size-5 text-primary" /> Edit Member Profile
        </span>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Member Full Name"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="member@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Phone Number (10 digits)"
            type="tel"
            maxLength={10}
            placeholder="9825012345"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="fieldset">
            <label className="fieldset-label font-medium text-xs text-base-content/80">Membership Tier</label>
            <select {...register('tier')} className="select select-bordered w-full text-sm">
              <option value="Standard">Standard Tier</option>
              <option value="Premium">Premium Tier</option>
              <option value="VIP">VIP All-Access</option>
              <option value="Junior">Junior Tier</option>
            </select>
            {errors.tier && (
              <span className="text-error text-xs mt-1">{errors.tier.message}</span>
            )}
          </div>

          <div className="fieldset">
            <label className="fieldset-label font-medium text-xs text-base-content/80">Status</label>
            <select {...register('status')} className="select select-bordered w-full text-sm">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
            {errors.status && (
              <span className="text-error text-xs mt-1">{errors.status.message}</span>
            )}
          </div>
        </div>

        <div className="modal-action pt-4 border-t border-base-300">
          <Button type="button" variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<FaCircleCheck className="size-4" />}
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};
