import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaPenToSquare, FaCircleCheck } from 'react-icons/fa6';
import { Modal, Button, Input, Avatar } from '@/components/ui';
import { DatePicker } from '@/components/ui/DatePicker';
import type { MemberDetail, MemberUpdatePayload } from '@/types/members';

const memberEditSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  photoUrl: z.string().url('Please enter a valid image URL').or(z.literal('')).optional(),
  dateOfBirth: z.string().optional(),
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
  // Split name if firstName and lastName are not explicitly set
  const nameParts = (member.name || '').trim().split(/\s+/);
  const initialFirstName = member.firstName || nameParts[0] || '';
  const initialLastName = member.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

  // Forms: React Hook Form + Zod (mode: 'onTouched').
  // Strict rule: Phone 10 digits regex (^\d{10}$), numbers only
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberEditFormData>({
    resolver: zodResolver(memberEditSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      email: member.email || '',
      phone: member.phone?.replace(/\D/g, '').slice(-10) || '',
      photoUrl: member.photoUrl || member.avatarUrl || '',
      dateOfBirth: member.dateOfBirth || '',
      tier: (member.tier as any) || 'Standard',
      status: (member.status as any) || 'active',
    },
  });

  const watchedPhotoUrl = watch('photoUrl');
  const watchedFirstName = watch('firstName');
  const watchedLastName = watch('lastName');

  const handleFormSubmit = async (data: MemberEditFormData) => {
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
    await onSubmit({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      name: fullName,
      email: data.email.trim(),
      phone: data.phone.trim(),
      photoUrl: data.photoUrl?.trim() || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
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
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Profile Picture & Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-base-200/50 rounded-xl border border-base-300">
          <Avatar
            src={watchedPhotoUrl || member.photoUrl || member.avatarUrl}
            fallbackText={`${watchedFirstName || ''} ${watchedLastName || ''}`}
            size="lg"
            className="ring-2 ring-primary/40 shrink-0"
          />
          <div className="flex-1 w-full">
            <Input
              label="Profile Picture URL"
              placeholder="https://images.unsplash.com/photo-..."
              {...register('photoUrl')}
              error={errors.photoUrl?.message}
            />
          </div>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="First Name"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            placeholder="Last Name"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        {/* Email & Phone */}
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
            inputMode="numeric"
            placeholder="9825012345"
            onKeyDown={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
                !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key) &&
                !e.ctrlKey &&
                !e.metaKey
              ) {
                e.preventDefault();
              }
            }}
            {...register('phone', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
              },
            })}
            error={errors.phone?.message}
          />
        </div>

        {/* Birthdate & Membership Tier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Date of Birth"
                placeholder="Select birthdate"
                value={field.value}
                onChange={field.onChange}
                maxDate={new Date().toISOString().split('T')[0]}
                error={errors.dateOfBirth?.message}
              />
            )}
          />

          <div className="fieldset">
            <label className="fieldset-label font-medium text-xs text-base-content/80">
              Membership Tier
            </label>
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
        </div>

        {/* Status */}
        <div className="fieldset">
          <label className="fieldset-label font-medium text-xs text-base-content/80">
            Account Status
          </label>
          <select {...register('status')} className="select select-bordered w-full text-sm">
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
          {errors.status && (
            <span className="text-error text-xs mt-1">{errors.status.message}</span>
          )}
        </div>

        {/* Footer */}
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
