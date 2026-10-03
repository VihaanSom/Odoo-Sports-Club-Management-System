import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaIdBadge, FaCircleCheck } from 'react-icons/fa6';
import { Modal, Input, Button } from '@/components/ui';

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  membershipPlan: z.enum(['Standard', 'Premium', 'VIP', 'Junior']),
  status: z.enum(['active', 'suspended', 'expired']),
});

export type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => Promise<void>;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      membershipPlan: 'Standard',
      status: 'active',
    },
  });

  const handleFormSubmit = async (data: MemberFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaIdBadge className="size-5 text-primary" /> Register New Club Member
        </span>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. John Hackathon"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="myemail@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="9876543210"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="fieldset">
            <label className="fieldset-label font-medium text-xs">Membership Plan</label>
            <select {...register('membershipPlan')} className="select select-bordered w-full text-sm">
              <option value="Standard">Standard ($49/mo)</option>
              <option value="Premium">Premium ($89/mo)</option>
              <option value="VIP">VIP All-Access ($149/mo)</option>
              <option value="Junior">Junior Tier ($29/mo)</option>
            </select>
          </div>

          <div className="fieldset">
            <label className="fieldset-label font-medium text-xs">Status</label>
            <select {...register('status')} className="select select-bordered w-full text-sm">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="modal-action pt-4 border-t border-base-300">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<FaCircleCheck className="size-4" />}
          >
            Save Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
