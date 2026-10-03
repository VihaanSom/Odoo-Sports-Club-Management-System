import {  useEffect  } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrophy, FaXmark } from 'react-icons/fa6';
import { mockMembers } from '@/mock/members';
import type { BarTable, CreateBarTabPayload } from '@/types/bar';

const openTabSchema = z.object({
  barTableId: z.coerce.number({ invalid_type_error: 'Table required' }).min(1, 'Select a table'),
  memberId: z.string().optional(),
  notes: z.string().max(250, 'Max 250 characters').optional(),
});

type OpenTabFormData = z.infer<typeof openTabSchema>;

interface OpenTabModalProps {
  isOpen: boolean;
  tables: BarTable[];
  preselectedTableId?: number | null;
  onClose: () => void;
  onSubmit: (payload: CreateBarTabPayload) => Promise<void>;
}

export const OpenTabModal = ({
  isOpen,
  tables,
  preselectedTableId,
  onClose,
  onSubmit,
}: OpenTabModalProps) => {
  const availableTables = tables.filter((t) => t.isActive && !t.activeTab);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OpenTabFormData>({
    resolver: zodResolver(openTabSchema),
    mode: 'onTouched',
    defaultValues: {
      barTableId: preselectedTableId || undefined,
      memberId: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        barTableId: preselectedTableId || (availableTables[0]?.id ? Number(availableTables[0].id) : undefined),
        memberId: '',
        notes: '',
      });
    }
  }, [isOpen, preselectedTableId, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: OpenTabFormData) => {
    await onSubmit({
      barTableId: Number(values.barTableId),
      memberId: values.memberId ? Number(values.memberId) : null,
      notes: values.notes || undefined,
    });
    onClose();
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-md">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <div className="flex items-center gap-2">
            <FaTrophy className="size-5 text-amber-500" />
            <h3 className="font-bold text-lg text-base-content">Open Bar Tab</h3>
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
                Table <span className="text-error">*</span>
              </span>
            </label>
            <select
              className={`select select-bordered w-full text-sm ${
                errors.barTableId ? 'select-error' : ''
              }`}
              {...register('barTableId')}
            >
              <option value="">Select table...</option>
              {availableTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tableNo} ({t.capacity} seats)
                </option>
              ))}
              {preselectedTableId && !availableTables.some((t) => t.id === preselectedTableId) && (
                <option value={preselectedTableId}>Table #{preselectedTableId}</option>
              )}
            </select>
            {errors.barTableId && (
              <span className="text-error text-xs mt-1">{errors.barTableId.message}</span>
            )}
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Linked Member (Optional)
              </span>
            </label>
            <select
              className="select select-bordered w-full text-sm"
              {...register('memberId')}
            >
              <option value="">Walk-in Guest (No Member Discount)</option>
              {mockMembers.map((m) => (
                <option key={m.id} value={m.id.replace(/\D/g, '') || m.id}>
                  {m.name} ({m.membershipPlan} Member)
                </option>
              ))}
            </select>
            <span className="text-base-content/60 text-xs mt-1">
              VIP members receive 10% discount; Premium receives 5%.
            </span>
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Notes
              </span>
            </label>
            <textarea
              placeholder="e.g. Courtside seating, extra napkins requested"
              className="textarea textarea-bordered w-full text-sm h-20"
              {...register('notes')}
            />
            {errors.notes && (
              <span className="text-error text-xs mt-1">{errors.notes.message}</span>
            )}
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
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
};
