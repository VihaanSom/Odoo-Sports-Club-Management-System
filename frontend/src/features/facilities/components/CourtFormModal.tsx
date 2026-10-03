import {  useEffect  } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrophy, FaXmark } from 'react-icons/fa6';
import type { Court, CreateCourtPayload, UpdateCourtPayload } from '@/types/courts';

const courtSchema = z.object({
  name: z.string().min(1, 'Court name required').max(50, 'Max 50 characters'),
  sport: z.enum(['tennis', 'cricket']),
  openTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:mm required'),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:mm required'),
  isActive: z.boolean(),
});

type CourtFormData = z.infer<typeof courtSchema>;

interface CourtFormModalProps {
  isOpen: boolean;
  court?: Court | null;
  onClose: () => void;
  onSubmit: (data: CreateCourtPayload | UpdateCourtPayload) => Promise<void>;
}

export const CourtFormModal = ({
  isOpen,
  court,
  onClose,
  onSubmit,
}: CourtFormModalProps) => {
  const isEdit = Boolean(court);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      sport: 'tennis',
      openTime: '06:00',
      closeTime: '22:00',
      isActive: true,
    },
  });

  useEffect(() => {
    if (court) {
      reset({
        name: court.name,
        sport: court.sport,
        openTime: court.openTime || '06:00',
        closeTime: court.closeTime || '22:00',
        isActive: court.isActive,
      });
    } else {
      reset({
        name: '',
        sport: 'tennis',
        openTime: '06:00',
        closeTime: '22:00',
        isActive: true,
      });
    }
  }, [court, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: CourtFormData) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle z-50">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-lg">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <div className="flex items-center gap-2">
            <FaTrophy className="size-5 text-amber-500" />
            <h3 className="font-bold text-lg text-base-content">
              {isEdit ? 'Edit Court' : 'New Court'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60"
            aria-label="Close"
          >
            <FaXmark className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Court Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Center Court 1 (Clay)"
              className={`input input-bordered w-full text-sm ${
                errors.name ? 'input-error' : ''
              }`}
              {...register('name')}
            />
            {errors.name && (
              <span className="text-error text-xs mt-1">{errors.name.message}</span>
            )}
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Sport Type <span className="text-error">*</span>
              </span>
            </label>
            <select
              className={`select select-bordered w-full text-sm capitalize ${
                errors.sport ? 'select-error' : ''
              }`}
              {...register('sport')}
            >
              <option value="tennis">Tennis</option>
              <option value="cricket">Cricket</option>
            </select>
            {errors.sport && (
              <span className="text-error text-xs mt-1">{errors.sport.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Open Time <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="06:00"
                className={`input input-bordered w-full text-sm ${
                  errors.openTime ? 'input-error' : ''
                }`}
                {...register('openTime')}
              />
              {errors.openTime && (
                <span className="text-error text-xs mt-1">{errors.openTime.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Close Time <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="22:00"
                className={`input input-bordered w-full text-sm ${
                  errors.closeTime ? 'input-error' : ''
                }`}
                {...register('closeTime')}
              />
              {errors.closeTime && (
                <span className="text-error text-xs mt-1">{errors.closeTime.message}</span>
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3 py-1">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                {...register('isActive')}
              />
              <span className="label-text font-medium text-sm">
                Active (Available for booking)
              </span>
            </label>
          </div>

          <div className="modal-action pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
