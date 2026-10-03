import { apiClient } from './apiClient';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';
import type {
  MemberDetail,
  MemberAddress,
  MemberActivityHistory,
  MemberRenewalPayload,
  MemberUpdatePayload,
  MemberLedgerEntry,
  CreateMemberPayload,
} from '@/types/members';
import type { MembershipPlan } from '@/types/models';

/**
 * Normalizes member response from backend API to match frontend MemberDetail interface.
 * Ensures backward compatibility with components expecting single name, membershipPlan, etc.
 */
const normalizeMember = (m: any): MemberDetail => {
  const firstName = m.firstName || '';
  const lastName = m.lastName || '';
  const fullName = m.name || `${firstName} ${lastName}`.trim() || 'Club Member';
  const tier = m.tier || 'Gold';
  const startDate = m.membershipStart || (m.createdAt ? m.createdAt.split('T')[0] : '');

  return {
    id: m.id,
    firstName,
    lastName,
    name: fullName,
    email: m.email || '',
    phone: m.phone || '',
    dateOfBirth: m.dateOfBirth || null,
    tier,
    membershipPlan: tier,
    status: m.status || 'active',
    membershipStart: startDate,
    membershipEnd: m.membershipEnd || '',
    joinedDate: startDate,
    photoUrl: m.photoUrl,
    avatarUrl: m.photoUrl,
    odooPartnerId: m.odooPartnerId,
    address: m.address || null,
    summary: m.summary || {
      totalBookings: 0,
      totalOrders: 0,
      totalSpentPaise: 0,
    },
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
};

export interface ListMembersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tier?: string;
  status?: string;
  sortBy?: 'created_at' | 'first_name' | 'last_name' | 'membership_end';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedMembersResult extends Array<MemberDetail> {
  data: MemberDetail[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const memberService = {
  /**
   * ME-01: List members with optional filtering and pagination
   * Returns a hybrid array with .data and .pagination properties attached
   */
  getAll: async (params?: ListMembersParams): Promise<PaginatedMembersResult> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page) cleanParams.page = params.page;
      if (params.pageSize) cleanParams.pageSize = params.pageSize;
      if (params.search) cleanParams.search = params.search;
      if (params.tier && params.tier !== 'all') cleanParams.tier = params.tier;
      if (params.status && params.status !== 'all') cleanParams.status = params.status;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;
    }

    const response = await apiClient.get<PaginatedApiResponse<any>>('/members', { params: cleanParams });
    const members = (response.data.data || []).map(normalizeMember);
    const pagination = response.data.pagination || {
      page: cleanParams.page || 1,
      pageSize: cleanParams.pageSize || members.length,
      total: members.length,
      totalPages: 1,
    };

    return Object.assign(members, { data: members, pagination });
  },

  /**
   * ME-02: Register/Create a new member (staff-side)
   */
  create: async (member: Partial<CreateMemberPayload> | Partial<MemberDetail>): Promise<MemberDetail> => {
    let firstName = member.firstName;
    let lastName = member.lastName;
    if ((!firstName || !lastName) && (member as any).name) {
      const parts = (member as any).name.trim().split(/\s+/);
      firstName = parts[0] || 'Member';
      lastName = parts.slice(1).join(' ') || parts[0] || 'Member';
    }

    const tier = (member.tier as any) || (member.membershipPlan as any) || 'Gold';
    // Map legacy tiers to valid backend enums: Gold, Silver, Junior
    let validTier: 'Gold' | 'Silver' | 'Junior' = 'Gold';
    if (tier === 'Silver' || tier === 'Standard') validTier = 'Silver';
    else if (tier === 'Junior') validTier = 'Junior';
    else validTier = 'Gold';

    // Determine active planId for the selected tier
    let planId = (member as any).planId ? Number((member as any).planId) : undefined;
    if (!planId) {
      try {
        const plansRes = await apiClient.get('/public/plans');
        const tierGroups: Array<{
          tier: string;
          plans: Array<{ id: number; durationMonths: number }>;
        }> = plansRes.data.data;

        const group = tierGroups?.find(
          (g) => g.tier.toLowerCase() === validTier.toLowerCase()
        );

        if (group && group.plans && group.plans.length > 0) {
          const monthlyPlan = group.plans.find((p) => p.durationMonths === 1);
          planId = monthlyPlan ? monthlyPlan.id : group.plans[0].id;
        }
      } catch {
        // Fallback to active DB seed range (Gold: 37, Silver: 40, Junior: 43)
        planId = validTier === 'Gold' ? 37 : validTier === 'Silver' ? 40 : 43;
      }
    }

    if (!planId) {
      planId = validTier === 'Gold' ? 37 : validTier === 'Silver' ? 40 : 43;
    }

    const payload: Record<string, any> = {
      firstName: firstName || 'New',
      lastName: lastName || 'Member',
      email: member.email || '',
      password: (member as any).password || 'Welcome@123',
      phone: member.phone || null,
      tier: validTier,
      planId,
    };

    if (member.dateOfBirth) {
      payload.dateOfBirth = member.dateOfBirth;
    } else if (validTier === 'Junior') {
      // Junior tier requires dateOfBirth < 18 years
      payload.dateOfBirth = '2010-01-01';
    }

    if (member.address && member.address.addrLine1) {
      payload.address = {
        addrLine1: member.address.addrLine1,
        addrLine2: member.address.addrLine2 || null,
        city: member.address.city || null,
        state: member.address.state || null,
        pincode: member.address.pincode,
      };
    }

    if (member.photoUrl) {
      payload.photoUrl = member.photoUrl;
    }

    const response = await apiClient.post<ApiResponse<any>>('/members', payload);
    return normalizeMember(response.data.data);
  },

  /**
   * ME-03: Get member detail by ID
   */
  getById: async (id: string | number): Promise<MemberDetail> => {
    const response = await apiClient.get<ApiResponse<any>>(`/members/${id}`);
    return normalizeMember(response.data.data);
  },

  /**
   * ME-04: Update member profile
   * Sends only valid mutable fields allowed by updateMemberSchema
   */
  update: async (id: string | number, payload: MemberUpdatePayload): Promise<MemberDetail> => {
    let firstName = payload.firstName;
    let lastName = payload.lastName;
    if ((!firstName || !lastName) && payload.name) {
      const parts = payload.name.trim().split(/\s+/);
      if (!firstName) firstName = parts[0];
      if (!lastName) lastName = parts.slice(1).join(' ') || undefined;
    }

    const body: Record<string, any> = {};
    if (firstName) body.firstName = firstName;
    if (lastName) body.lastName = lastName;
    if (payload.email) body.email = payload.email;
    if (payload.phone !== undefined) body.phone = payload.phone;
    if (payload.dateOfBirth !== undefined) body.dateOfBirth = payload.dateOfBirth || null;
    if (payload.tier) {
      let tier = payload.tier;
      if (tier === 'Standard') tier = 'Silver';
      else if (tier === 'Premium' || tier === 'VIP') tier = 'Gold';
      body.tier = tier;
    }
    if (payload.photoUrl !== undefined) body.photoUrl = payload.photoUrl;

    const response = await apiClient.put<ApiResponse<any>>(`/members/${id}`, body);
    return normalizeMember(response.data.data);
  },

  /**
   * ME-05: Renew membership
   */
  renew: async (
    id: string | number,
    payload: MemberRenewalPayload
  ): Promise<{
    member: MemberDetail;
    ledgerEntry: MemberLedgerEntry;
    payment: any;
  }> => {
    const body = {
      durationMonths: Number(payload.durationMonths),
      paymentMethod: payload.paymentMethod,
      amountPaise: Math.round(Number(payload.amountPaise)),
      referenceNo: payload.referenceNo || undefined,
    };

    const response = await apiClient.post<ApiResponse<any>>(`/members/${id}/renew`, body);
    const data = response.data.data;

    let fullMember: MemberDetail;
    try {
      fullMember = await memberService.getById(id);
    } catch {
      fullMember = normalizeMember(data);
    }

    const ledgerEntry: MemberLedgerEntry = {
      id: `PAY-${data.payment?.id || Date.now()}`,
      date: data.payment?.paidAt ? data.payment.paidAt.split('T')[0] : new Date().toISOString().split('T')[0],
      description: `Membership Renewal (${payload.durationMonths} Months - ${payload.paymentMethod.toUpperCase()})`,
      type: 'renewal',
      amountPaise: payload.amountPaise,
      balancePaise: 0,
      referenceNo: payload.referenceNo || `TXN-RNW-${Date.now()}`,
    };

    return {
      member: fullMember,
      ledgerEntry,
      payment: data.payment,
    };
  },

  /**
   * ME-06: Activity history (bookings, orders, bar tabs, total spend)
   */
  getHistory: async (
    id: string | number,
    query?: { from?: string; to?: string }
  ): Promise<MemberActivityHistory> => {
    const response = await apiClient.get<ApiResponse<any>>(`/members/${id}/history`, { params: query });
    const data = response.data.data;
    const bookings = data.bookings || [];
    const orders = data.orders || [];
    const barTabs = data.barTabs || [];

    const ledger: MemberLedgerEntry[] = [
      ...bookings.map((b: any) => ({
        id: `BK-PAY-${b.id}`,
        date: b.slotStart ? b.slotStart.split('T')[0] : '',
        description: `Court Booking - ${b.courtName} (${b.sport})`,
        type: 'booking' as const,
        amountPaise: b.amountPaidPaise || 0,
        referenceNo: `BK-${b.id}`,
      })),
      ...orders.map((o: any) => ({
        id: `ORD-PAY-${o.id}`,
        date: o.createdAt ? o.createdAt.split('T')[0] : '',
        description: `Pro Shop Order (${o.orderType})`,
        type: 'order' as const,
        amountPaise: o.totalAmountPaise || 0,
        referenceNo: `ORD-${o.id}`,
      })),
      ...barTabs.map((t: any) => ({
        id: `TAB-PAY-${t.id}`,
        date: t.settledAt ? t.settledAt.split('T')[0] : '',
        description: `Bar Tab Settled (Table ${t.tableNo})`,
        type: 'bar' as const,
        amountPaise: t.totalPaise || 0,
        referenceNo: `TAB-${t.id}`,
      })),
    ].sort((a, b) => (b.date > a.date ? 1 : -1));

    return {
      bookings,
      orders,
      barTabs,
      ledger,
      totalSpentPaise: data.totalSpentPaise || 0,
    };
  },

  /**
   * MA-01: Get member's structured address
   */
  getAddress: async (id: string | number): Promise<MemberAddress | null> => {
    const response = await apiClient.get<ApiResponse<MemberAddress | null>>(`/members/${id}/address`);
    return response.data.data;
  },

  /**
   * MA-02: Create/update member address
   */
  updateAddress: async (id: string | number, address: Partial<MemberAddress>): Promise<MemberAddress> => {
    const body = {
      addrLine1: address.addrLine1 || '',
      addrLine2: address.addrLine2 || null,
      city: address.city || null,
      state: address.state || null,
      pincode: address.pincode || '',
    };
    const response = await apiClient.put<ApiResponse<MemberAddress>>(`/members/${id}/address`, body);
    return response.data.data;
  },

  /**
   * MA-03: Delete member address
   */
  deleteAddress: async (id: string | number): Promise<boolean> => {
    await apiClient.delete(`/members/${id}/address`);
    return true;
  },
};

export interface CreateMembershipPlanPayload {
  tier: 'Gold' | 'Silver' | 'Junior';
  durationMonths: 1 | 6 | 12;
  pricePaise: number;
  courtRatePaise: number;
  shopDiscountPct: number;
  barDiscountPct: number;
}

export interface UpdateMembershipPlanPayload {
  pricePaise?: number;
  courtRatePaise?: number;
  shopDiscountPct?: number;
  barDiscountPct?: number;
  isActive?: boolean;
}

export const membershipPlanService = {
  /**
   * MP-01: List all membership plans for admin review
   */
  getAll: async (): Promise<MembershipPlan[]> => {
    let rawList: any[] = [];
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/membership-plans');
      rawList = response.data.data || [];
    } catch {
      // Fallback to public plans if unauthorized
      const response = await apiClient.get<ApiResponse<any[]>>('/public/plans');
      const data = response.data.data || [];
      if (data.length > 0 && Array.isArray(data[0]?.plans)) {
        rawList = data.flatMap((g: any) =>
          (g.plans || []).map((p: any) => ({
            ...p,
            tier: g.tier || p.tier,
          }))
        );
      } else {
        rawList = data;
      }
    }

    // Handle nested tiers if present
    if (rawList.length > 0 && Array.isArray(rawList[0]?.plans)) {
      rawList = rawList.flatMap((g: any) =>
        (g.plans || []).map((p: any) => ({
          ...p,
          tier: g.tier || p.tier,
        }))
      );
    }

    return rawList.map((p) => {
      const duration = p.durationMonths ?? p.duration_months ?? 1;
      const paise = p.pricePaise ?? (p.price ? Math.round(Number(p.price) * 100) : 0);
      const courtRate = p.courtRatePaise ?? (p.courtRate ? Math.round(Number(p.courtRate) * 100) : 0);
      const shopDisc = p.shopDiscountPct ?? p.shop_discount_pct ?? 0;
      const barDisc = p.barDiscountPct ?? p.bar_discount_pct ?? 0;
      const tier = p.tier || 'Gold';

      return {
        id: p.id || Math.random(),
        name: `${tier} (${duration} Mo)`,
        tier,
        durationMonths: duration,
        pricePaise: paise,
        courtRatePaise: courtRate,
        shopDiscountPct: shopDisc,
        barDiscountPct: barDisc,
        isActive: p.isActive ?? true,
        price: `₹${(paise / 100).toLocaleString()}`,
        period: `/ ${duration} mo`,
        desc: `${tier} tier subscription for ${duration} months`,
        popular: tier === 'Gold' && duration === 12,
        badge: tier === 'Gold' ? 'Best Value' : tier === 'Junior' ? 'Youth' : 'Popular',
        features: [
          `Court rate: ₹${(courtRate / 100).toFixed(0)}/hr`,
          `${shopDisc}% Pro Shop discount`,
          `${barDisc}% Bar & Lounge discount`,
          `${duration} month duration`,
        ],
      };
    });
  },

  /**
   * MP-02: Create new membership plan
   */
  create: async (payload: CreateMembershipPlanPayload): Promise<MembershipPlan> => {
    const response = await apiClient.post<ApiResponse<any>>('/membership-plans', payload);
    const p = response.data.data;
    return {
      id: p.id,
      name: `${p.tier} (${p.durationMonths} Mo)`,
      tier: p.tier,
      durationMonths: p.durationMonths,
      pricePaise: p.pricePaise,
      courtRatePaise: p.courtRatePaise,
      shopDiscountPct: p.shopDiscountPct,
      barDiscountPct: p.barDiscountPct,
      isActive: p.isActive,
      price: `₹${(p.pricePaise / 100).toLocaleString()}`,
      period: `/ ${p.durationMonths} mo`,
      desc: `${p.tier} tier subscription for ${p.durationMonths} months`,
      features: [
        `Court rate: ₹${(p.courtRatePaise / 100).toFixed(0)}/hr`,
        `${p.shopDiscountPct}% Pro Shop discount`,
        `${p.barDiscountPct}% Bar & Lounge discount`,
      ],
    };
  },

  /**
   * MP-03: Update membership plan
   */
  update: async (id: number, payload: UpdateMembershipPlanPayload): Promise<MembershipPlan> => {
    const response = await apiClient.put<ApiResponse<any>>(`/membership-plans/${id}`, payload);
    const p = response.data.data;
    return {
      id: p.id,
      name: `${p.tier} (${p.durationMonths} Mo)`,
      tier: p.tier,
      durationMonths: p.durationMonths,
      pricePaise: p.pricePaise,
      courtRatePaise: p.courtRatePaise,
      shopDiscountPct: p.shopDiscountPct,
      barDiscountPct: p.barDiscountPct,
      isActive: p.isActive,
      price: `₹${(p.pricePaise / 100).toLocaleString()}`,
      period: `/ ${p.durationMonths} mo`,
      desc: `${p.tier} tier subscription for ${p.durationMonths} months`,
      features: [
        `Court rate: ₹${(p.courtRatePaise / 100).toFixed(0)}/hr`,
        `${p.shopDiscountPct}% Pro Shop discount`,
        `${p.barDiscountPct}% Bar & Lounge discount`,
      ],
    };
  },
};
