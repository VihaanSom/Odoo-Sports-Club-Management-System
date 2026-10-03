import {  useEffect, useState, useCallback  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import {
  FaTrophy,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaCalendarDays,
  FaUserTie,
  FaClock,
  FaCircleCheck,
  FaUserPlus,
} from 'react-icons/fa6';
import { Button, Badge, Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { leadService } from '@/services/leadService';
import type { Lead, UpdateLeadPayload } from '@/types/leads';
import { LeadStatusUpdateForm } from './components/LeadStatusUpdateForm';

export const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLead = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await leadService.getById(id);
      if (data) setLead(data);
    } catch {
      toast.error('Failed to load lead details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleUpdateStatus = async (payload: UpdateLeadPayload) => {
    if (!id || !lead) return;
    try {
      const updated = await leadService.updateStatus(id, payload);
      setLead(updated);
      toast.success('Lead status updated');
    } catch {
      toast.error('Failed to update lead');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="card bg-base-200/50 border border-base-300 p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Lead Not Found</h2>
        <p className="text-sm text-base-content/60">
          The requested enquiry record ID (#{id}) could not be located.
        </p>
        <div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaArrowLeft className="size-3.5" />}
            onClick={() => navigate('/leads')}
          >
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<FaArrowLeft className="size-3.5" />}
          onClick={() => navigate('/leads')}
        >
          Back
        </Button>

        {lead.status !== 'converted' && (
          <Button
            variant="success"
            size="sm"
            className="text-success-content"
            leftIcon={<FaUserPlus className="size-3.5" />}
            onClick={() => {
              handleUpdateStatus({ status: 'converted' });
              toast.success('Lead marked as Converted!');
            }}
          >
            Next
          </Button>
        )}
      </div>

      {/* Main Header Card */}
      <div className="card bg-base-200/50 border border-base-300 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
                {lead.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-base-300 text-base-content/80 font-bold">
                ID #{lead.id}
              </span>
            </div>

            <p className="text-xs text-base-content/60 mt-1">
              Source: <span className="font-semibold capitalize">{lead.source?.replace('_', ' ') || 'Website'}</span> · Captured on {formatDate(lead.createdAt)}
            </p>
          </div>

          <Badge
            size="md"
            variant={
              lead.status === 'converted'
                ? 'success'
                : lead.status === 'contacted'
                ? 'warning'
                : lead.status === 'new'
                ? 'accent'
                : 'error'
            }
            className="capitalize font-bold px-3 py-1 text-sm gap-2"
          >
            <FaTrophy className="size-3.5 text-amber-500" />
            Stage: {lead.status}
          </Badge>
        </div>

        {/* Pipeline Stepper Visual */}
        <div className="py-2">
          <ul className="steps steps-horizontal w-full text-xs">
            <li className="step step-primary font-medium">New Enquiry</li>
            <li
              className={`step ${
                lead.status === 'contacted' || lead.status === 'converted'
                  ? 'step-primary font-medium'
                  : ''
              }`}
            >
              Contacted & Follow-up
            </li>
            <li
              className={`step ${
                lead.status === 'converted'
                  ? 'step-success font-medium text-success'
                  : lead.status === 'lost'
                  ? 'step-error font-medium text-error'
                  : ''
              }`}
            >
              {lead.status === 'lost' ? 'Lost / Declined' : 'Member Converted'}
            </li>
          </ul>
        </div>
      </div>

      {/* Grid: Prospect Details & Status Management Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prospect Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-200/50 border border-base-300 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-base-content/80 border-b border-base-300 pb-2">
              Prospect Details
            </h3>

            <div className="text-xs space-y-3">
              {lead.email && (
                <div className="flex items-start gap-2.5">
                  <FaEnvelope className="size-3.5 text-base-content/40 mt-0.5" />
                  <div>
                    <span className="text-base-content/50 block">Email</span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-start gap-2.5">
                  <FaPhone className="size-3.5 text-base-content/40 mt-0.5" />
                  <div>
                    <span className="text-base-content/50 block">Phone</span>
                    <a
                      href={`tel:${lead.phone}`}
                      className="font-medium text-base-content hover:underline font-mono"
                    >
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}

              {lead.sport && (
                <div className="flex items-start gap-2.5">
                  <FaTrophy className="size-3.5 text-amber-500 mt-0.5" />
                  <div>
                    <span className="text-base-content/50 block">Interested Sport</span>
                    <span className="font-bold text-base-content capitalize">
                      {lead.sport}
                    </span>
                  </div>
                </div>
              )}

              {(lead.preferredDate || lead.preferredTime) && (
                <div className="flex items-start gap-2.5">
                  <FaCalendarDays className="size-3.5 text-base-content/40 mt-0.5" />
                  <div>
                    <span className="text-base-content/50 block">Preferred Trial Slot</span>
                    <span className="font-medium text-base-content">
                      {lead.preferredDate ? formatDate(lead.preferredDate) : ''}{' '}
                      {lead.preferredTime || ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <FaUserTie className="size-3.5 text-base-content/40 mt-0.5" />
                <div>
                  <span className="text-base-content/50 block">Assigned Staff</span>
                  <span className="font-semibold text-base-content">
                    {lead.assignedStaffName || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FaClock className="size-3.5 text-base-content/40 mt-0.5" />
                <div>
                  <span className="text-base-content/50 block">Last Updated</span>
                  <span className="font-mono text-base-content/70">
                    {formatDate(lead.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enquiry message card */}
          {lead.message && (
            <div className="card bg-base-200/50 border border-base-300 p-5 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Enquiry Note
              </h3>
              <p className="text-xs text-base-content/80 whitespace-pre-wrap leading-relaxed">
                "{lead.message}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Update Status Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-200/50 border border-base-300 p-6 shadow-xs space-y-4">
            <div className="border-b border-base-300 pb-3">
              <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                <FaCircleCheck className="size-4 text-primary" /> Manage Progression & Assignment
              </h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                Update lead status, assign club staff member, and record notes.
              </p>
            </div>

            <LeadStatusUpdateForm lead={lead} onSubmit={handleUpdateStatus} />
          </div>

          {lead.notes && (
            <div className="card bg-base-100 border border-base-300 p-5 shadow-xs space-y-2 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Logged Activity & Notes
              </h3>
              <div className="p-3 rounded-xl bg-base-200/60 text-xs text-base-content/90 font-mono">
                {lead.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LeadDetailPage;
