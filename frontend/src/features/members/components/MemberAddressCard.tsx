import {  useState  } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaLocationDot, FaPenToSquare, FaCircleCheck } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { INDIAN_STATES } from '@/config/indiaStates';
import type { MemberAddress } from '@/types/members';

const addressSchema = z.object({
  addrLine1: z.string().min(3, 'Address line 1 is required (min 3 chars)'),
  addrLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface MemberAddressCardProps {
  address?: MemberAddress | null;
  onSaveAddress: (address: MemberAddress) => Promise<void>;
}

export const MemberAddressCard = ({
  address,
  onSaveAddress,
}: MemberAddressCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Forms: React Hook Form + Zod (mode: 'onTouched').
  // Strict rule: India state dropdown MUST default to "Gujarat" imported from '@/config/indiaStates'
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: 'onTouched',
    defaultValues: {
      addrLine1: address?.addrLine1 || '',
      addrLine2: address?.addrLine2 || '',
      city: address?.city || '',
      state: address?.state || 'Gujarat',
      pincode: address?.pincode || '',
    },
  });

  const handleStartEdit = () => {
    reset({
      addrLine1: address?.addrLine1 || '',
      addrLine2: address?.addrLine2 || '',
      city: address?.city || '',
      state: address?.state || 'Gujarat',
      pincode: address?.pincode || '',
    });
    setIsEditing(true);
  };

  const handleFormSubmit = async (data: AddressFormData) => {
    try {
      await onSaveAddress({
        id: address?.id,
        memberId: address?.memberId,
        addrLine1: data.addrLine1,
        addrLine2: data.addrLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      });
      toast.success('Address saved');
      setIsEditing(false);
    } catch {
      toast.error('Failed to save address');
    }
  };

  return (
    <div className="card bg-base-200/50 border border-base-300 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-base-300 pb-3">
        <h2 className="text-sm font-bold tracking-wide uppercase text-base-content/70 flex items-center gap-2">
          <FaLocationDot className="size-3.5 text-primary" /> Member Address
        </h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<FaPenToSquare className="size-3" />}
            onClick={handleStartEdit}
          >
            Save
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="text-sm space-y-1">
          {address?.addrLine1 ? (
            <>
              <p className="font-semibold text-base-content">{address.addrLine1}</p>
              {address.addrLine2 && (
                <p className="text-base-content/80">{address.addrLine2}</p>
              )}
              <p className="text-base-content/70">
                {address.city ? `${address.city}, ` : ''}
                {address.state || 'Gujarat'} - {address.pincode}
              </p>
            </>
          ) : (
            <p className="text-xs text-base-content/50 italic py-2">
              No address on file. Click to add.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
          <Input
            label="Address Line 1"
            placeholder="Flat / House / Street"
            {...register('addrLine1')}
            error={errors.addrLine1?.message}
          />

          <Input
            label="Address Line 2 (Optional)"
            placeholder="Locality / Landmark"
            {...register('addrLine2')}
            error={errors.addrLine2?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              placeholder="e.g. Ahmedabad"
              {...register('city')}
              error={errors.city?.message}
            />

            <div className="fieldset">
              <label className="fieldset-label font-medium text-xs text-base-content/80">State</label>
              <select
                {...register('state')}
                defaultValue="Gujarat"
                className="select select-bordered w-full text-sm"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && (
                <span className="text-error text-xs mt-1">{errors.state.message}</span>
              )}
            </div>

            <Input
              label="Pincode (6 digits)"
              placeholder="380054"
              maxLength={6}
              {...register('pincode')}
              error={errors.pincode?.message}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-300">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<FaCircleCheck className="size-3.5" />}
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
