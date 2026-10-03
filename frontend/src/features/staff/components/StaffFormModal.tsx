 import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { StaffMember, CreateStaffPayload, StaffRole } from '@/types/staff';

const staffSchema = z.object({
  firstName: z.string().min(2, 'First name required (min 2 chars)'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  role: z.enum(['admin', 'front_desk', 'bar', 'shop']),
  hourlyRateRupees: z
    .coerce
    .number({ invalid_type_error: 'Hourly rate must be a valid number' })
    .int('Hourly rate must be an integer (no decimals)')
    .min(0, 'Hourly rate must be 0 or more'),
  notes: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateStaffPayload) => Promise<void>;
  initialData?: StaffMember | null;
}

export const StaffFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: StaffFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'front_desk',
      hourlyRateRupees: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || initialData.name.split(' ')[0] || '',
        lastName: initialData.lastName || initialData.name.split(' ').slice(1).join(' ') || '',
        email: initialData.email,
        phone: initialData.phone.replace(/\D/g, '').slice(-10),
        role: initialData.role,
        hourlyRateRupees: Math.round(initialData.hourlyRatePaise / 100),
        notes: initialData.notes || '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'front_desk',
        hourlyRateRupees: 0,
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: StaffFormData) => {
    const payload: CreateStaffPayload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: data.role as StaffRole,
      hourlyRatePaise: Math.round(data.hourlyRateRupees * 100),
      notes: data.notes?.trim() || '',
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Staff Member' : 'New Staff Member'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">First Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh"
              className={`input input-bordered w-full input-sm ${errors.firstName ? 'input-error' : ''}`}
              {...register('firstName')}
            />
            {errors.firstName && (
              <span className="text-xs text-error mt-1">{errors.firstName.message}</span>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Last Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Patel"
              className={`input input-bordered w-full input-sm ${errors.lastName ? 'input-error' : ''}`}
              {...register('lastName')}
            />
            {errors.lastName && (
              <span className="text-xs text-error mt-1">{errors.lastName.message}</span>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Email *</span>
            </label>
            <input
              type="email"
              placeholder="e.g. ramesh@championsclub.in"
              className={`input input-bordered w-full input-sm ${errors.email ? 'input-error' : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <span className="text-xs text-error mt-1">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Phone (10 Digits) *</span>
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. 9825011223"
              className={`input input-bordered w-full input-sm ${errors.phone ? 'input-error' : ''}`}
              {...register('phone')}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
              }}
            />
            {errors.phone && (
              <span className="text-xs text-error mt-1">{errors.phone.message}</span>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Staff Role *</span>
            </label>
            <select
              className="select select-bordered w-full select-sm"
              {...register('role')}
            >
              <option value="admin">Admin</option>
              <option value="front_desk">Front Desk</option>
              <option value="bar">Bar</option>
              <option value="shop">Shop</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Hourly Rate (₹) *</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 500"
              className={`input input-bordered w-full input-sm ${errors.hourlyRateRupees ? 'input-error' : ''}`}
              {...register('hourlyRateRupees')}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
              }}
            />
            {errors.hourlyRateRupees && (
              <span className="text-xs text-error mt-1">
                {errors.hourlyRateRupees.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="label">
            <span className="label-text font-medium text-xs">Internal Notes</span>
          </label>
          <textarea
            rows={2}
            className="textarea textarea-bordered w-full text-xs"
            placeholder="Operational notes, shift preferences, etc."
            {...register('notes')}
          />
        </div>

        <div className="modal-action flex justify-end gap-2 pt-2 border-t border-base-300">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Back
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffFormModal;
