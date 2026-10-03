import { apiClient } from './apiClient';
import type { RenewalDueMember, MemberInvoice, GenerateInvoiceResponse } from '@/types/invoices';

export interface BackendRenewalMember {
  memberId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tier: string;
  membershipEnd: string;
  daysRemaining: number;
}

export interface BackendGenerateInvoiceData {
  invoiceNumber: string;
  memberId: number;
  memberName: string;
  tier: string;
  currentMembershipEnd: string;
  renewalAmountPaise: number;
  generatedAt: string;
}

// In-memory store for invoices generated during the current application session
const sessionInvoices: MemberInvoice[] = [];

export const invoiceService = {
  // IN-01: List members due for renewal (GET /invoices/members)
  getRenewalDues: async (): Promise<RenewalDueMember[]> => {
    const response = await apiClient.get<{ success: boolean; data: BackendRenewalMember[] }>('/invoices/members');
    const raw: BackendRenewalMember[] = (response.data as any).data || response.data || [];

    const tierPricesPaise: Record<string, number> = {
      Gold: 5000000,
      Silver: 3000000,
      Junior: 1500000,
      VIP: 8000000,
      Standard: 4900000,
    };

    return raw.map((m) => {
      const name = `${m.firstName || ''} ${m.lastName || ''}`.trim() || `Member ${m.memberId}`;
      const renewalAmountPaise = tierPricesPaise[m.tier] || 5000000;
      const existingInv = sessionInvoices.find((inv) => String(inv.memberId) === String(m.memberId));

      return {
        memberId: m.memberId,
        firstName: m.firstName,
        lastName: m.lastName,
        name,
        email: m.email,
        phone: m.phone,
        tier: m.tier,
        membershipEnd: m.membershipEnd,
        daysRemaining: m.daysRemaining,
        renewalAmountPaise,
        lastInvoiceNumber: existingInv ? existingInv.invoiceNumber : null,
      };
    });
  },

  // IN-02: Generate membership renewal invoice (POST /invoices/:memberId)
  generateInvoice: async (memberId: string | number): Promise<GenerateInvoiceResponse> => {
    const numericMemberId = typeof memberId === 'string' ? parseInt(memberId.replace(/\D/g, ''), 10) || memberId : memberId;
    const response = await apiClient.post<{ success: boolean; data: BackendGenerateInvoiceData }>(`/invoices/${numericMemberId}`);
    const data: BackendGenerateInvoiceData = (response.data as any).data || response.data;

    const dueDate = data.currentMembershipEnd;
    const newEndDate = new Date(new Date(data.currentMembershipEnd).getTime() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newInvoice: MemberInvoice = {
      invoiceNumber: data.invoiceNumber,
      memberId: data.memberId,
      memberName: data.memberName,
      tier: data.tier,
      currentMembershipEnd: data.currentMembershipEnd,
      newMembershipEnd: newEndDate,
      renewalAmountPaise: data.renewalAmountPaise,
      generatedAt: data.generatedAt,
      dueDate,
      status: 'issued',
      notes: `Automated renewal invoice generated for ${data.tier} Annual Membership.`,
    };

    // Store in session cache
    const existingIndex = sessionInvoices.findIndex((i) => i.invoiceNumber === newInvoice.invoiceNumber);
    if (existingIndex >= 0) {
      sessionInvoices[existingIndex] = newInvoice;
    } else {
      sessionInvoices.unshift(newInvoice);
    }

    return {
      invoiceNumber: data.invoiceNumber,
      memberId: data.memberId,
      memberName: data.memberName,
      tier: data.tier,
      currentMembershipEnd: data.currentMembershipEnd,
      renewalAmountPaise: data.renewalAmountPaise,
      generatedAt: data.generatedAt,
      invoice: newInvoice,
    };
  },

  // Get all session-generated invoices
  getAllInvoices: async (): Promise<MemberInvoice[]> => {
    return [...sessionInvoices];
  },

  // Get invoice by invoiceNumber
  getInvoiceById: async (invoiceNumber: string): Promise<MemberInvoice | undefined> => {
    return sessionInvoices.find((i) => i.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase());
  },
};

export default invoiceService;
