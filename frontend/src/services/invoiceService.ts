import { apiClient } from './apiClient';
import { mockRenewalDues, mockInvoices } from '@/mock/invoices';
import { mockMembers } from '@/mock/members';
import type { RenewalDueMember, MemberInvoice, GenerateInvoiceResponse } from '@/types/invoices';

let localRenewalDues: RenewalDueMember[] = JSON.parse(JSON.stringify(mockRenewalDues));
let localInvoices: MemberInvoice[] = JSON.parse(JSON.stringify(mockInvoices));

export const invoiceService = {
  // IN-01: Members due for renewal
  getRenewalDues: async (): Promise<RenewalDueMember[]> => {
    try {
      const response = await apiClient.get<RenewalDueMember[] | { data: RenewalDueMember[] }>('/invoices/members');
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      return localRenewalDues;
    } catch {
      return localRenewalDues;
    }
  },

  // IN-02: Generate membership renewal invoice
  generateInvoice: async (memberId: string | number): Promise<GenerateInvoiceResponse> => {
    try {
      const response = await apiClient.post<GenerateInvoiceResponse>(`/invoices/${memberId}`);
      return response.data;
    } catch {
      const dueItem = localRenewalDues.find((d) => String(d.memberId) === String(memberId));
      const member = mockMembers.find((m) => String(m.id) === String(memberId));

      const memberName = dueItem?.name || member?.name || `Member ${memberId}`;
      const tier = dueItem?.tier || member?.membershipPlan || 'Standard';
      const currentMembershipEnd = dueItem?.membershipEnd || '2026-10-31';

      // Tier pricing in paise
      const tierPricesPaise: Record<string, number> = {
        Junior: 290000,
        Standard: 490000,
        Premium: 890000,
        VIP: 1490000,
      };
      const renewalAmountPaise = dueItem?.renewalAmountPaise || tierPricesPaise[tier] || 490000;

      const nextNum = localInvoices.length + 42;
      const invoiceNumber = `INV-2026-${String(nextNum).padStart(4, '0')}`;

      // Due date is current membership end date or 14 days from now
      const dueDate = currentMembershipEnd;
      const newEndDate = new Date(new Date(currentMembershipEnd).getTime() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const newInvoice: MemberInvoice = {
        invoiceNumber,
        memberId,
        memberName,
        memberEmail: dueItem?.email || member?.email,
        memberPhone: dueItem?.phone || member?.phone,
        tier,
        currentMembershipEnd,
        newMembershipEnd: newEndDate,
        renewalAmountPaise,
        generatedAt: new Date().toISOString(),
        dueDate,
        status: 'issued',
        notes: `Automated renewal invoice generated for ${tier} Annual Membership.`,
      };

      // Record in local invoices
      localInvoices.unshift(newInvoice);

      // Update renewal due member record
      if (dueItem) {
        dueItem.lastInvoiceNumber = invoiceNumber;
      }

      return {
        invoiceNumber,
        memberId,
        memberName,
        tier,
        currentMembershipEnd,
        renewalAmountPaise,
        generatedAt: newInvoice.generatedAt,
        invoice: newInvoice,
      };
    }
  },

  // Get all generated invoices
  getAllInvoices: async (): Promise<MemberInvoice[]> => {
    try {
      const response = await apiClient.get<MemberInvoice[] | { data: MemberInvoice[] }>('/invoices');
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      return localInvoices;
    } catch {
      return localInvoices;
    }
  },

  // Get invoice by invoiceNumber
  getInvoiceById: async (invoiceNumber: string): Promise<MemberInvoice | undefined> => {
    try {
      const response = await apiClient.get<MemberInvoice>(`/invoices/${invoiceNumber}`);
      return response.data;
    } catch {
      return localInvoices.find((i) => i.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase());
    }
  },
};
