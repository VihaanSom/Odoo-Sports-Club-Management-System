import {  useEffect, useState, useCallback  } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import {
  FaTrophy,
  FaFileInvoiceDollar,
  FaClock,
  FaEye,
} from 'react-icons/fa6';
import { Badge, Skeleton, Button } from '@/components/ui';
import { formatPaise, formatDate } from '@/lib/utils';
import { invoiceService } from '@/services/invoiceService';
import type { RenewalDueMember, MemberInvoice } from '@/types/invoices';
import {
  RenewalDueTable,
  InvoicePreviewModal,
} from './components';

export const RenewalInvoicesPage = () => {
  const [renewalDues, setRenewalDues] = useState<RenewalDueMember[]>([]);
  const [invoices, setInvoices] = useState<MemberInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dues' | 'invoices'>('dues');
  const [selectedInvoice, setSelectedInvoice] = useState<MemberInvoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [duesData, invoicesData] = await Promise.all([
        invoiceService.getRenewalDues(),
        invoiceService.getAllInvoices(),
      ]);
      setRenewalDues(duesData);
      setInvoices(invoicesData);
    } catch {
      toast.error('Failed to load invoice records');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvoiceGenerated = (newInvoice: MemberInvoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    setRenewalDues((prev) =>
      prev.map((d) =>
        String(d.memberId) === String(newInvoice.memberId)
          ? { ...d, lastInvoiceNumber: newInvoice.invoiceNumber }
          : d
      )
    );
    setSelectedInvoice(newInvoice);
    setIsPreviewOpen(true);
  };

  const handlePreviewInvoice = (invoiceNumber: string) => {
    const inv = invoices.find((i) => i.invoiceNumber === invoiceNumber);
    if (inv) {
      setSelectedInvoice(inv);
      setIsPreviewOpen(true);
    }
  };

  // Metrics
  const totalDueRevenuePaise = renewalDues.reduce((sum, d) => sum + d.renewalAmountPaise, 0);
  const urgentCount = renewalDues.filter((d) => d.daysRemaining <= 7).length;
  const totalInvoicesPaidPaise = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.renewalAmountPaise, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3 text-base-content">
            <FaTrophy className="size-7 text-amber-500" /> Membership Invoices & Dues
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage membership renewal cycle dues, billing schedules, and issued invoice slips.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
          <span className="text-xs uppercase font-bold text-base-content/50 tracking-wider">
            Members Due For Renewal
          </span>
          <span className="text-2xl font-black text-base-content mt-1">
            {renewalDues.length}
          </span>
        </div>

        <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
          <span className="text-xs uppercase font-bold text-primary tracking-wider">
            Projected Dues Revenue
          </span>
          <span className="text-2xl font-black text-primary mt-1">
            {formatPaise(totalDueRevenuePaise)}
          </span>
        </div>

        <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
          <span className="text-xs uppercase font-bold text-error tracking-wider">
            Urgent / Overdue (≤7d)
          </span>
          <span className="text-2xl font-black text-error mt-1">
            {urgentCount}
          </span>
        </div>

        <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
          <span className="text-xs uppercase font-bold text-success tracking-wider">
            Collected Paid Invoices
          </span>
          <span className="text-2xl font-black text-success mt-1">
            {formatPaise(totalInvoicesPaidPaise)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-box bg-base-200/60 p-1.5 rounded-2xl border border-base-300 inline-flex">
        <button
          type="button"
          onClick={() => setActiveTab('dues')}
          className={`tab tab-sm sm:tab-md gap-2 rounded-xl font-medium transition-all ${
            activeTab === 'dues' ? 'tab-active bg-primary text-primary-content font-bold shadow-xs' : ''
          }`}
        >
          <FaClock className="size-3.5" /> Renewal Dues ({renewalDues.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`tab tab-sm sm:tab-md gap-2 rounded-xl font-medium transition-all ${
            activeTab === 'invoices' ? 'tab-active bg-primary text-primary-content font-bold shadow-xs' : ''
          }`}
        >
          <FaFileInvoiceDollar className="size-3.5" /> Issued Invoices ({invoices.length})
        </button>
      </div>

      {/* Tab Panels */}
      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : activeTab === 'dues' ? (
        <RenewalDueTable
          renewalDues={renewalDues}
          onInvoiceGenerated={handleInvoiceGenerated}
          onPreviewInvoice={handlePreviewInvoice}
        />
      ) : (
        <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-base-300/40">
                  <th>Invoice #</th>
                  <th>Member Name</th>
                  <th>Tier</th>
                  <th>Amount</th>
                  <th>Generated Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-base-300/30">
                    <td className="font-mono font-bold text-xs text-primary">
                      {inv.invoiceNumber}
                    </td>
                    <td>
                      <span className="font-bold">{inv.memberName}</span>
                      <span className="text-[11px] text-base-content/50 block font-mono">
                        {inv.memberId}
                      </span>
                    </td>
                    <td>
                      <Badge size="xs" variant="ghost" className="font-bold">
                        {inv.tier}
                      </Badge>
                    </td>
                    <td className="font-bold font-mono text-base-content">
                      {formatPaise(inv.renewalAmountPaise)}
                    </td>
                    <td className="font-mono text-xs text-base-content/70">
                      {formatDate(inv.generatedAt)}
                    </td>
                    <td className="font-mono text-xs text-base-content/70">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td>
                      <Badge
                        size="xs"
                        variant={
                          inv.status === 'paid'
                            ? 'success'
                            : inv.status === 'issued'
                            ? 'secondary'
                            : 'error'
                        }
                        className="capitalize font-bold"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        leftIcon={<FaEye className="size-3" />}
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsPreviewOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}

                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-base-content/50">
                      No invoices issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Slip Preview Modal */}
      {selectedInvoice && (
        <InvoicePreviewModal
          invoice={selectedInvoice}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default RenewalInvoicesPage;
