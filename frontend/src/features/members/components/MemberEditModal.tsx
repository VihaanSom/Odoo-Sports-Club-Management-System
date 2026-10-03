import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaPenToSquare, FaCircleCheck, FaCamera, FaUser } from 'react-icons/fa6';
import { Modal, Button, Input, Badge } from '@/components/ui';
import { DatePicker } from '@/components/ui/DatePicker';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { MemberDetail, MemberUpdatePayload } from '@/types/members';

const memberEditSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    photoUrl: z.string().optional().nullable(),
    dateOfBirth: z.string().optional(),
    tier: z.enum(['Gold', 'Silver', 'Junior']),
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

  // Map legacy tier to valid enum
  let currentTier: 'Gold' | 'Silver' | 'Junior' = 'Gold';
  if (member.tier === 'Silver' || member.tier === 'Standard') currentTier = 'Silver';
  else if (member.tier === 'Junior') currentTier = 'Junior';
  else currentTier = 'Gold';

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
      tier: currentTier,
    },
  });

  const watchedPhotoUrl = watch('photoUrl');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size validation: 1 MB limit
    const MAX_SIZE_BYTES = 1 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image size must be under 1 MB');
      e.target.value = '';
      return;
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP images are allowed');
      e.target.value = '';
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);
    setIsUploadingPhoto(true);

    try {
      const uploadedUrl = await authService.uploadProfilePicture(file);
      setValue('photoUrl', uploadedUrl, { shouldValidate: true });
      toast.success('Photo uploaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload photo. Please try again.');
      setPhotoPreview(null);
      setValue('photoUrl', '');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setValue('photoUrl', '');
  };

  const handleFormSubmit = async (data: MemberEditFormData) => {
    // Only pass mutable fields permitted by backend ME-04 validator
    await onSubmit({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      photoUrl: data.photoUrl?.trim() || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      tier: data.tier,
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
        {/* Minimal Profile Photo Upload */}
        <div className="flex flex-col items-center justify-center pt-1 pb-2">
          <label className="relative group cursor-pointer block">
            <div className="size-20 rounded-full overflow-hidden border-2 border-dashed border-base-content/25 group-hover:border-primary transition-all bg-base-200/60 flex items-center justify-center shadow-inner">
              {photoPreview || watchedPhotoUrl ? (
                <img
                  src={photoPreview || watchedPhotoUrl}
                  alt="Profile"
                  className="size-full object-cover"
                />
              ) : (
                <FaUser className="size-8 text-base-content/30 group-hover:text-primary/70 transition-colors" />
              )}
            </div>

            {/* Camera icon badge */}
            <div
              className={cn(
                'absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-content flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all border-2 border-base-100',
                isUploadingPhoto && 'pointer-events-none opacity-50'
              )}
            >
              {isUploadingPhoto ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <FaCamera className="size-3" />
              )}
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={isUploadingPhoto}
            />
          </label>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-medium text-base-content/50">Max 1 MB</span>
            {(watchedPhotoUrl || photoPreview) && (
              <>
                <span className="text-base-content/30">•</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isUploadingPhoto}
                  className="text-[11px] font-medium text-error hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </>
            )}
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
              <option value="Gold">Gold Tier (₹5,000/mo - 15% discount)</option>
              <option value="Silver">Silver Tier (₹3,000/mo - 10% discount)</option>
              <option value="Junior">Junior Tier (&lt;18 yrs - ₹2,000/mo)</option>
            </select>
            {errors.tier && (
              <span className="text-error text-xs mt-1">{errors.tier.message}</span>
            )}
          </div>
        </div>

        {/* Account Status (read-only display as backend status is immutable) */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-300">
          <div className="text-xs">
            <span className="font-bold text-base-content block">Account Status</span>
            <span className="text-base-content/60">Managed by system & renewals</span>
          </div>
          <Badge
            size="sm"
            variant={
              member.status === 'active'
                ? 'success'
                : member.status === 'suspended'
                ? 'warning'
                : 'error'
            }
            className="capitalize"
          >
            {member.status}
          </Badge>
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
