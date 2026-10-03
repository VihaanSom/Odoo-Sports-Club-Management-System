import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaCircleCheck } from 'react-icons/fa6';
import { Button, TextArea } from '@/components/ui';
import type { Lead, UpdateLeadPayload } from '@/types/leads';

const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'converted', 'lost']),
  assignedTo: z.coerce.number().nullable().optional(),
  notes: z.string().optional(),
});

type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;

interface LeadStatusUpdateFormProps {
  lead: Lead;
  onSubmit: (data: UpdateLeadPayload) => Promise<void>;
}

export const LeadStatusUpdateForm = ({
  lead,
  onSubmit,
}: LeadStatusUpdateFormProps) => {
  // Forms: React Hook Form + Zod (mode: 'onTouched').
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateLeadFormData>({
    resolver: zodResolver(updateLeadSchema),
    mode: 'onTouched',
    defaultValues: {
      status: lead.status,
      assignedTo: lead.assignedTo ?? null,
      notes: lead.notes || '',
    },
  });

  const handleFormSubmit = async (data: UpdateLeadFormData) => {
    await onSubmit({
      status: data.status,
      assignedTo: data.assignedTo !== undefined ? data.assignedTo : null,
      notes: data.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div className="fieldset">
          <label className="fieldset-label font-medium text-xs text-base-content/80">Pipeline Stage</label>
          <select {...register('status')} className="select select-bordered w-full text-sm">
            <option value="new">New Enquiry</option>
            <option value="contacted">Contacted / In Discussion</option>
            <option value="converted">Converted to Member</option>
            <option value="lost">Lost / Declined</option>
          </select>
          {errors.status && (
            <span className="text-error text-xs mt-1">{errors.status.message}</span>
          )}
        </div>

        {/* Assigned Staff */}
        <div className="fieldset">
          <label className="fieldset-label font-medium text-xs text-base-content/80">Assigned Staff</label>
          <select {...register('assignedTo')} className="select select-bordered w-full text-sm">
            <option value="">Unassigned</option>
            <option value={1}>Mike Staff (Front Desk)</option>
            <option value={2}>Elena Vance (Membership)</option>
            <option value={3}>Carlos Rivera (Head Coach)</option>
          </select>
          {errors.assignedTo && (
            <span className="text-error text-xs mt-1">{errors.assignedTo.message}</span>
          )}
        </div>
      </div>

      {/* Follow-up Notes */}
      <TextArea
        label="Staff Follow-up Notes"
        placeholder="Record conversation summary, trial booking details, or next action..."
        rows={3}
        {...register('notes')}
        error={errors.notes?.message}
      />

      <div className="flex justify-end pt-2">
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
  );
};
