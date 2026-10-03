import { FaTrophy, FaPrint, FaReceipt } from 'react-icons/fa6';
import { Modal, Button, Badge } from '@/components/ui';
import { formatPaise, formatDate } from '@/lib/utils';
import type { MemberInvoice } from '@/types/invoices';

interface InvoicePreviewModalProps {
  invoice: MemberInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePreviewModal = ({
  invoice,
  isOpen,
  onClose,
}: InvoicePreviewModalProps) => {
  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaReceipt className="size-5 text-primary" /> Invoice {invoice.invoiceNumber}
        </span>
      }
      maxWidth="lg"
    >
      <div className="space-y-6 print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-base-300 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <FaTrophy className="size-7 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-base-content">
                Champions Club
              </h2>
              <p className="text-xs text-base-content/60">
                Sports & Leisure Enclave · Ahmedabad, Gujarat
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-base-content/50 uppercase tracking-widest block font-bold">
              Invoice Reference
            </span>
            <span className="text-lg font-mono font-black text-primary">
              {invoice.invoiceNumber}
            </span>
            <div className="mt-1">
              <Badge
                size="sm"
                variant={
                  invoice.status === 'paid'
                    ? 'success'
                    : invoice.status === 'issued'
                    ? 'secondary'
                    : 'error'
                }
                className="capitalize font-bold"
              >
                {invoice.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Member & Date Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/50 p-4 rounded-xl text-xs">
          <div>
            <span className="text-base-content/50 block font-bold uppercase tracking-wider mb-1">
              Billed To
            </span>
            <p className="font-bold text-sm text-base-content">{invoice.memberName}</p>
            <p className="text-base-content/70 font-mono">Member ID: {invoice.memberId}</p>
            {invoice.memberEmail && <p className="text-base-content/70">{invoice.memberEmail}</p>}
            {invoice.memberPhone && <p className="text-base-content/70 font-mono">{invoice.memberPhone}</p>}
          </div>

          <div className="space-y-1 sm:text-right">
            <div>
              <span className="text-base-content/50">Issue Date:</span>{' '}
              <span className="font-mono font-medium">{formatDate(invoice.generatedAt)}</span>
            </div>
            <div>
              <span className="text-base-content/50">Due Date:</span>{' '}
              <span className="font-mono font-bold text-warning-content">{formatDate(invoice.dueDate)}</span>
            </div>
            {invoice.newMembershipEnd && (
              <div>
                <span className="text-base-content/50">Validity Extension:</span>{' '}
                <span className="font-mono">{formatDate(invoice.newMembershipEnd)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="overflow-x-auto">
          <table className="table w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-base-300/40">
                <th>Description</th>
                <th>Period</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="font-bold">{invoice.tier} Membership Annual Renewal</div>
                  <div className="text-xs text-base-content/60">
                    Includes access to courts, club facilities, and member privileges.
                  </div>
                </td>
                <td className="font-mono text-xs">12 Months</td>
                <td className="text-right font-mono">{formatPaise(invoice.renewalAmountPaise)}</td>
                <td className="text-right font-bold font-mono text-base-content">
                  {formatPaise(invoice.renewalAmountPaise)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-base-300 text-sm">
                <th colSpan={3} className="text-right font-bold">
                  Total Due:
                </th>
                <th className="text-right font-black text-primary text-base font-mono">
                  {formatPaise(invoice.renewalAmountPaise)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>

        {invoice.notes && (
          <p className="text-xs text-base-content/60 italic bg-base-200/40 p-3 rounded-lg">
            Note: {invoice.notes}
          </p>
        )}

        <div className="modal-action pt-4 border-t border-base-300 flex justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<FaPrint className="size-3.5" />}
            onClick={() => window.print()}
          >
            Print
          </Button>

          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Back
          </Button>
        </div>
      </div>
    </Modal>
  );
};
