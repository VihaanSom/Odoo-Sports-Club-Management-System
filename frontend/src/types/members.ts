import type { MembershipTier, MemberStatus } from './enums';
import type { Member } from './models';

export interface MemberAddress {
  id?: number;
  memberId?: number | string;
  addrLine1: string;
  addrLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode: string;
}

export interface MemberSummary {
  totalBookings: number;
  totalOrders: number;
  totalSpentPaise: number;
}

export type MemberPlanTier =
  | MembershipTier
  | 'Gold'
  | 'Silver'
  | 'Junior'
  | 'Standard'
  | 'Premium'
  | 'VIP';

export interface MemberDetail extends Member {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  tier: MemberPlanTier;
  membershipPlan?: MemberPlanTier;
  membershipStart?: string;
  membershipEnd?: string;
  status: MemberStatus | 'active' | 'suspended' | 'expired';
  /** @deprecated Use membershipStart */
  joinedDate?: string;
  photoUrl?: string;
  avatarUrl?: string;
  odooPartnerId?: number;
  address?: MemberAddress | null;
  summary?: MemberSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberHistoryBooking {
  id: number | string;
  courtName: string;
  sport: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  amountPaidPaise: number;
}

export interface MemberHistoryOrder {
  id: number | string;
  orderNumber?: string;
  orderType: string;
  totalAmountPaise: number;
  status: string;
  createdAt: string;
  itemsCount?: number;
}

export interface MemberHistoryBarTab {
  id: number | string;
  tableNo: string;
  status: string;
  totalPaise: number;
  settledAt?: string | null;
}

export interface MemberLedgerEntry {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit' | 'booking' | 'order' | 'bar' | 'renewal';
  amountPaise: number;
  balancePaise?: number;
  referenceNo?: string;
}

export interface MemberActivityHistory {
  bookings: MemberHistoryBooking[];
  orders: MemberHistoryOrder[];
  barTabs: MemberHistoryBarTab[];
  ledger: MemberLedgerEntry[];
  totalSpentPaise: number;
}

export interface MemberRenewalPayload {
  durationMonths: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  amountPaise: number;
  referenceNo?: string;
}

export interface MemberUpdatePayload {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  tier?: 'Gold' | 'Silver' | 'Junior' | 'VIP' | 'Standard' | 'Premium';
  membershipPlan?: string;
  photoUrl?: string;
  status?: 'active' | 'suspended' | 'expired';
}

export interface CreateMemberPayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  password?: string;
  dateOfBirth?: string;
  tier: 'Gold' | 'Silver' | 'Junior' | 'VIP' | 'Standard' | 'Premium';
  planId?: number;
  membershipPlan?: string;
  address?: MemberAddress;
  photoUrl?: string;
}
