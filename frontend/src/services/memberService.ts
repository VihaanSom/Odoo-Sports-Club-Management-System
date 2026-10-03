import { apiClient } from './apiClient';
import { mockMembers } from '@/mock/members';
import { mockBookings } from '@/mock/bookings';
import { mockOrders } from '@/mock/orders';
import { mockBarTabs } from '@/mock/barTabs';
import type {
  MemberDetail,
  MemberAddress,
  MemberActivityHistory,
  MemberRenewalPayload,
  MemberUpdatePayload,
  MemberLedgerEntry,
} from '@/types';

// In-memory member store with rich default data
interface EnhancedMemberStore extends MemberDetail {
  address: MemberAddress;
  ledger: MemberLedgerEntry[];
}

const defaultAddresses: Record<string, MemberAddress> = {
  'MEM-001': {
    id: 1,
    memberId: 'MEM-001',
    addrLine1: 'B-402, Shivalik Highstreet, Judges Bungalow Rd',
    addrLine2: 'Bodakdev',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054',
  },
  'MEM-002': {
    id: 2,
    memberId: 'MEM-002',
    addrLine1: '12, Alkapuri Society, Opp. Circuit House',
    addrLine2: 'Alkapuri',
    city: 'Vadodara',
    state: 'Gujarat',
    pincode: '390007',
  },
  'MEM-003': {
    id: 3,
    memberId: 'MEM-003',
    addrLine1: '701, Rajhans Synfonia, Dumas Road',
    addrLine2: 'Vesu',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '395007',
  },
  'MEM-004': {
    id: 4,
    memberId: 'MEM-004',
    addrLine1: '45, Kalawad Road, Near Kotecha Chowk',
    addrLine2: 'University Road',
    city: 'Rajkot',
    state: 'Gujarat',
    pincode: '360005',
  },
  'MEM-005': {
    id: 5,
    memberId: 'MEM-005',
    addrLine1: '104, Golden Triangle, Navrangpura',
    addrLine2: 'Near Stadium Circle',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380009',
  },
  'MEM-006': {
    id: 6,
    memberId: 'MEM-006',
    addrLine1: '202, Platinum Residency, Iscon Cross Road',
    addrLine2: 'SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
  },
};

const defaultLedgers: Record<string, MemberLedgerEntry[]> = {
  'MEM-001': [
    {
      id: 'LED-001',
      date: '2026-10-02',
      description: 'Pro Shop Purchase (ORD-2026-1001)',
      type: 'order',
      amountPaise: 2501730,
      balancePaise: 2501730,
      referenceNo: 'ORD-2026-1001',
    },
    {
      id: 'LED-002',
      date: '2026-09-15',
      description: 'Court Booking - Center Court 1 (Clay)',
      type: 'booking',
      amountPaise: 40000,
      balancePaise: 0,
      referenceNo: 'BK-1001',
    },
    {
      id: 'LED-003',
      date: '2025-10-15',
      description: 'Annual VIP All-Access Membership Renewal',
      type: 'renewal',
      amountPaise: 1490000,
      balancePaise: 0,
      referenceNo: 'INV-2026-0041',
    },
  ],
  'MEM-002': [
    {
      id: 'LED-004',
      date: '2026-09-28',
      description: 'Bar Tab Settled - Table T2',
      type: 'bar',
      amountPaise: 125000,
      balancePaise: 125000,
      referenceNo: 'TAB-1002',
    },
    {
      id: 'LED-005',
      date: '2025-10-08',
      description: 'Annual VIP Membership Fee',
      type: 'renewal',
      amountPaise: 1490000,
      balancePaise: 0,
      referenceNo: 'INV-2025-0012',
    },
  ],
  'MEM-003': [
    {
      id: 'LED-006',
      date: '2026-09-20',
      description: 'Annual Premium Membership Renewal Paid',
      type: 'renewal',
      amountPaise: 890000,
      balancePaise: 0,
      referenceNo: 'INV-2026-0039',
    },
  ],
};

let localMembers: EnhancedMemberStore[] = mockMembers.map((m, idx) => {
  const memberId = m.id;
  const address = defaultAddresses[memberId] || {
    id: idx + 1,
    memberId,
    addrLine1: 'Champions Club Sports Enclave, SG Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054',
  };

  const ledger = defaultLedgers[memberId] || [
    {
      id: `LED-${100 + idx}`,
      date: m.joinedDate || '2026-01-15',
      description: `${m.membershipPlan} Membership Registration`,
      type: 'renewal',
      amountPaise: m.membershipPlan === 'VIP' ? 1490000 : m.membershipPlan === 'Premium' ? 890000 : 490000,
      balancePaise: 0,
      referenceNo: `REG-${m.id}`,
    },
  ];

  return {
    ...m,
    tier: (m.membershipPlan as any) || 'Standard',
    status: (m.status as any) || 'active',
    membershipStart: m.joinedDate || '2026-01-15',
    membershipEnd: memberId === 'MEM-001' ? '2026-10-15' : memberId === 'MEM-004' ? '2026-10-02' : '2027-01-15',
    address,
    ledger,
    summary: {
      totalBookings: 6 + idx * 3,
      totalOrders: 3 + idx * 2,
      totalSpentPaise: (25000 + idx * 12000) * 100,
    },
  };
});

export const memberService = {
  // ME-01: List members with optional filtering
  getAll: async (params?: { search?: string; tier?: string; status?: string }): Promise<MemberDetail[]> => {
    try {
      const response = await apiClient.get<MemberDetail[] | { data: MemberDetail[] }>('/members', { params });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      return localMembers;
    } catch {
      let filtered = [...localMembers];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.phone.includes(q) ||
            String(m.id).toLowerCase().includes(q)
        );
      }
      if (params?.tier && params.tier !== 'all') {
        filtered = filtered.filter((m) => m.tier?.toLowerCase() === params.tier?.toLowerCase());
      }
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((m) => m.status === params.status);
      }
      return filtered;
    }
  },

  // ME-02: Register/Create member
  create: async (member: Partial<MemberDetail>): Promise<MemberDetail> => {
    try {
      const response = await apiClient.post<MemberDetail>('/members', member);
      return response.data;
    } catch {
      const newId = `MEM-00${localMembers.length + 1}`;
      const newMember: EnhancedMemberStore = {
        id: newId,
        name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'New Member',
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || '',
        phone: member.phone || '',
        tier: (member.tier as any) || 'Standard',
        membershipPlan: member.membershipPlan || (member.tier as any) || 'Standard',
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        membershipStart: new Date().toISOString().split('T')[0],
        membershipEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        address: member.address || {
          addrLine1: '',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380001',
        },
        ledger: [
          {
            id: `LED-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: 'New Member Registration',
            type: 'renewal',
            amountPaise: member.tier === 'VIP' ? 1490000 : 490000,
            balancePaise: 0,
          },
        ],
        summary: {
          totalBookings: 0,
          totalOrders: 0,
          totalSpentPaise: 0,
        },
      };
      localMembers.unshift(newMember);
      return newMember;
    }
  },

  // ME-03: Get member detail by ID
  getById: async (id: string | number): Promise<MemberDetail | undefined> => {
    try {
      const response = await apiClient.get<MemberDetail>(`/members/${id}`);
      return response.data;
    } catch {
      const found = localMembers.find((m) => String(m.id).toLowerCase() === String(id).toLowerCase());
      return found;
    }
  },

  // ME-04: Update member profile
  update: async (id: string | number, payload: MemberUpdatePayload): Promise<MemberDetail> => {
    try {
      const response = await apiClient.put<MemberDetail>(`/members/${id}`, payload);
      return response.data;
    } catch {
      const index = localMembers.findIndex((m) => String(m.id).toLowerCase() === String(id).toLowerCase());
      if (index === -1) throw new Error('Member not found');

      const existing = localMembers[index];
      const updated: EnhancedMemberStore = {
        ...existing,
        ...payload,
        name: payload.name || (payload.firstName ? `${payload.firstName} ${payload.lastName || ''}`.trim() : existing.name),
        tier: (payload.tier || existing.tier) as any,
        membershipPlan: (payload.membershipPlan || payload.tier || existing.membershipPlan) as any,
        status: payload.status || existing.status,
        updatedAt: new Date().toISOString(),
      };
      localMembers[index] = updated;
      return updated;
    }
  },

  // ME-05: Renew membership
  renew: async (
    id: string | number,
    payload: MemberRenewalPayload
  ): Promise<{ member: MemberDetail; ledgerEntry: MemberLedgerEntry }> => {
    try {
      const response = await apiClient.post<{ member: MemberDetail; ledgerEntry: MemberLedgerEntry }>(
        `/members/${id}/renew`,
        payload
      );
      return response.data;
    } catch {
      const index = localMembers.findIndex((m) => String(m.id).toLowerCase() === String(id).toLowerCase());
      if (index === -1) throw new Error('Member not found');

      const member = localMembers[index];
      const currentEndDate = member.membershipEnd ? new Date(member.membershipEnd) : new Date();
      const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();
      baseDate.setMonth(baseDate.getMonth() + payload.durationMonths);
      const newEndDate = baseDate.toISOString().split('T')[0];

      const ledgerEntry: MemberLedgerEntry = {
        id: `LED-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Membership Renewal (${payload.durationMonths} Months - ${payload.paymentMethod.toUpperCase()})`,
        type: 'renewal',
        amountPaise: payload.amountPaise,
        balancePaise: 0,
        referenceNo: payload.referenceNo || `TXN-RNW-${Date.now()}`,
      };

      const updated: EnhancedMemberStore = {
        ...member,
        membershipEnd: newEndDate,
        status: 'active',
        ledger: [ledgerEntry, ...member.ledger],
        summary: {
          ...member.summary,
          totalBookings: member.summary?.totalBookings ?? 0,
          totalOrders: member.summary?.totalOrders ?? 0,
          totalSpentPaise: (member.summary?.totalSpentPaise ?? 0) + payload.amountPaise,
        },
      };

      localMembers[index] = updated;
      return { member: updated, ledgerEntry };
    }
  },

  // ME-06: Activity history (bookings, orders, bar tabs)
  getHistory: async (id: string | number): Promise<MemberActivityHistory> => {
    try {
      const response = await apiClient.get<MemberActivityHistory>(`/members/${id}/history`);
      return response.data;
    } catch {
      const member = localMembers.find((m) => String(m.id).toLowerCase() === String(id).toLowerCase());
      const memberName = member?.name || '';

      // Match bookings by member name or memberId
      const bookings = mockBookings
        .filter((b) => b.memberName.toLowerCase() === memberName.toLowerCase() || b.memberId === String(id))
        .map((b) => ({
          id: b.id,
          courtName: b.facilityName,
          sport: b.facilityName.toLowerCase().includes('cricket') ? 'cricket' : 'tennis',
          slotStart: `${b.date}T10:00:00Z`,
          slotEnd: `${b.date}T11:00:00Z`,
          status: b.status,
          amountPaidPaise: (b.totalPrice || 400) * 100,
        }));

      // Match orders
      const orders = mockOrders
        .filter((o) => (o.memberName ? o.memberName.toLowerCase() === memberName.toLowerCase() : false) || String(o.memberId) === String(id))
        .map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          orderType: o.orderType,
          totalAmountPaise: o.totalPaise,
          status: o.status,
          createdAt: o.createdAt,
          itemsCount: o.items.length,
        }));

      // Match bar tabs
      const barTabs = mockBarTabs
        .filter((t) => (t.memberName ? t.memberName.toLowerCase() === memberName.toLowerCase() : false) || String(t.memberId) === String(id))
        .map((t) => ({
          id: t.id,
          tableNo: t.tableNo || 'T1',
          status: t.status,
          totalPaise: t.totalPaise,
          settledAt: t.settledAt,
        }));

      const ledger = member?.ledger || [];
      const totalSpentPaise =
        bookings.reduce((sum, b) => sum + b.amountPaidPaise, 0) +
        orders.reduce((sum, o) => sum + o.totalAmountPaise, 0) +
        barTabs.reduce((sum, t) => sum + t.totalPaise, 0);

      return {
        bookings,
        orders,
        barTabs,
        ledger,
        totalSpentPaise,
      };
    }
  },

  // ME-07: Member Address Management (MA-01, MA-02, MA-03)
  getAddress: async (id: string | number): Promise<MemberAddress | null> => {
    try {
      const response = await apiClient.get<MemberAddress>(`/members/${id}/address`);
      return response.data;
    } catch {
      const member = localMembers.find((m) => String(m.id).toLowerCase() === String(id).toLowerCase());
      return member?.address || null;
    }
  },

  updateAddress: async (id: string | number, address: MemberAddress): Promise<MemberAddress> => {
    try {
      const response = await apiClient.put<MemberAddress>(`/members/${id}/address`, address);
      return response.data;
    } catch {
      const index = localMembers.findIndex((m) => String(m.id).toLowerCase() === String(id).toLowerCase());
      if (index === -1) throw new Error('Member not found');

      localMembers[index].address = address;
      return address;
    }
  },

  deleteAddress: async (id: string | number): Promise<boolean> => {
    try {
      await apiClient.delete(`/members/${id}/address`);
      return true;
    } catch {
      const index = localMembers.findIndex((m) => String(m.id).toLowerCase() === String(id).toLowerCase());
      if (index !== -1) {
        localMembers[index].address = {
          addrLine1: '',
          pincode: '',
          state: 'Gujarat',
        };
      }
      return true;
    }
  },

  // ME-08: Financial Ledger
  getLedger: async (id: string | number): Promise<MemberLedgerEntry[]> => {
    try {
      const response = await apiClient.get<MemberLedgerEntry[]>(`/members/${id}/ledger`);
      return response.data;
    } catch {
      const member = localMembers.find((m) => String(m.id).toLowerCase() === String(id).toLowerCase());
      return member?.ledger || [];
    }
  },
};
