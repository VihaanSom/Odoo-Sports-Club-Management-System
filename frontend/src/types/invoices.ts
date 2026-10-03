export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue';

export interface RenewalDueMember {
  memberId: number | string;
  firstName?: string;
  lastName?: string;
  name: string;
  email?: string;
  phone?: string;
  tier: string;
  membershipEnd: string;
  daysRemaining: number;
  renewalAmountPaise: number;
  lastInvoiceNumber?: string | null;
}

export interface MemberInvoice {
  invoiceNumber: string;
  memberId: number | string;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  tier: string;
  currentMembershipEnd: string;
  newMembershipEnd?: string;
  renewalAmountPaise: number;
  generatedAt: string;
  dueDate: string;
  status: InvoiceStatus;
  notes?: string;
}

export interface GenerateInvoiceResponse {
  invoiceNumber: string;
  memberId: number | string;
  memberName: string;
  tier: string;
  currentMembershipEnd: string;
  renewalAmountPaise: number;
  generatedAt: string;
  invoice: MemberInvoice;
}
