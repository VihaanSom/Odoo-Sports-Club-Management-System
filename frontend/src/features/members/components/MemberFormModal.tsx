import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaIdBadge, FaCircleCheck } from 'react-icons/fa6';
import { Modal, Input, Button } from '@/components/ui';
import { DatePicker } from '@/components/ui/DatePicker';
import { INDIAN_STATES } from '@/config/indiaStates';
import type { CreateMemberPayload } from '@/types/members';

const memberSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters').default('Member@123'),
    tier: z.enum(['Gold', 'Silver', 'Junior']),
    dateOfBirth: z.string().optional(),
    addrLine1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().default('Gujarat'),
    pincode: z.string().regex(/^(\d{6})?$/, 'Pincode must be 6 digits').optional(),
  })
  .refine(
    (data) => {
      if (data.tier === 'Junior') {
        if (!data.dateOfBirth) return false;
        const dob = new Date(data.dateOfBirth);
        const ageDifMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age < 18;
      }
      return true;
    },
    {
      message: 'Junior members must be under 18 years of age. Please select a valid birthdate.',
      path: ['dateOfBirth'],
    }
  );

export type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMemberPayload) => Promise<void>;
}

export const MemberFormModal = ({
  isOpen,
  onClose,
  onSubmit,
}: MemberFormModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: 'Member@123',
      tier: 'Gold',
      dateOfBirth: '',
      addrLine1: '',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '',
    },
  });

  const handleFormSubmit = async (data: MemberFormData) => {
    const payload: CreateMemberPayload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: data.password || 'Welcome@123',
      tier: data.tier,
      dateOfBirth: data.dateOfBirth || undefined,
      address: data.addrLine1 && data.pincode ? {
        addrLine1: data.addrLine1.trim(),
        city: data.city?.trim() || null,
        state: data.state || 'Gujarat',
        pincode: data.pincode.trim(),
      } : undefined,
    };

    await onSubmit(payload);
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
        {/* Name inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="e.g. Rahul"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            placeholder="e.g. Patel"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        {/* Contact inputs */}
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

        {/* Tier & Initial Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="fieldset">
            <label className="fieldset-label font-medium text-xs text-base-content/80">Membership Tier</label>
            <select {...register('tier')} className="select select-bordered w-full text-sm">
              <option value="Gold">Gold Tier (₹5,000/mo - 15% discount)</option>
              <option value="Silver">Silver Tier (₹3,000/mo - 10% discount)</option>
              <option value="Junior">Junior Tier (&lt;18 yrs - ₹2,000/mo)</option>
            </select>
            {errors.tier && (
              <span className="text-error text-xs mt-1">{errors.tier.message}</span>
            )}
          </div>

          <Input
            label="Initial Password"
            type="text"
            placeholder="Member@123"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>

        {/* Date of Birth */}
        <div>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Date of Birth (Required for Junior Tier)"
                placeholder="Select birthdate"
                value={field.value}
                onChange={field.onChange}
                maxDate={new Date().toISOString().split('T')[0]}
                error={errors.dateOfBirth?.message}
              />
            )}
          />
        </div>

        {/* Optional Address section */}
        <div className="p-3 bg-base-200/40 rounded-xl border border-base-300 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Address Details (Optional)
          </span>

          <Input
            label="Address Line 1"
            placeholder="Flat / House / Street"
            {...register('addrLine1')}
            error={errors.addrLine1?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              placeholder="Ahmedabad"
              {...register('city')}
              error={errors.city?.message}
            />

            <div className="fieldset">
              <label className="fieldset-label font-medium text-xs text-base-content/80">State</label>
              <select {...register('state')} className="select select-bordered w-full text-sm">
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Pincode (6 digits)"
              placeholder="380054"
              maxLength={6}
              inputMode="numeric"
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
              {...register('pincode', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                },
              })}
              error={errors.pincode?.message}
            />
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
            Register Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
