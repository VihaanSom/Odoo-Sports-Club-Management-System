import { apiClient } from './apiClient';
import type {
  PaymentRecord,
  PaymentQueryParams,
  RecordPaymentPayload,
  RefundPaymentPayload,
  PaymentSummaryStats,
  PaymentCategory,
  LedgerPaymentMethod,
} from '@/types/payments';

export interface BackendPaymentItem {
  id: number;
  memberId: number | null;
  memberName: string | null;
  bookingId: number | null;
  orderId: number | null;
  barTabId: number | null;
  amountPaise: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'plan';
  referenceNo: string;
  notes: string | null;
  paidAt: string;
}

export interface BackendPaymentsResponse {
  success: boolean;
  data: BackendPaymentItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const calculateStats = (records: PaymentRecord[]): PaymentSummaryStats => {
  let totalVolumePaise = 0;
  let successfulCount = 0;
  let pendingCount = 0;
  let refundedVolumePaise = 0;
  let upiCount = 0;
  let cardCount = 0;
  let cashCount = 0;

  records.forEach((r) => {
    if (r.status === 'success') {
      totalVolumePaise += r.amountPaise;
      successfulCount++;
    } else if (r.status === 'pending') {
      pendingCount++;
    } else if (r.status === 'refunded') {
      refundedVolumePaise += r.refundedAmountPaise || r.amountPaise;
    }

    if (r.method === 'upi') upiCount++;
    else if (r.method === 'card') cardCount++;
    else if (r.method === 'cash') cashCount++;
  });

  const totalMethods = upiCount + cardCount + cashCount || 1;

  return {
    totalVolumePaise,
    successfulCount,
    pendingCount,
    refundedVolumePaise,
    upiPercentage: Math.round((upiCount / totalMethods) * 100),
    cardPercentage: Math.round((cardCount / totalMethods) * 100),
    cashPercentage: Math.round((cashCount / totalMethods) * 100),
  };
};

// In-memory overrides for manual refunds or records made during current session
const sessionRefunds = new Map<string, { status: 'refunded'; refundedAmountPaise: number; notes: string }>();
const sessionAddedPayments: PaymentRecord[] = [];

export const paymentService = {
  // PM-01: Unified payment ledger with filter, search, pagination, and stats
  getPayments: async (
    params?: PaymentQueryParams
  ): Promise<{ data: PaymentRecord[]; total: number; stats: PaymentSummaryStats }> => {
    const backendParams: Record<string, any> = {
      page: params?.page || 1,
      pageSize: params?.limit || 100,
    };

    if (params?.method && params.method !== 'all' && ['cash', 'card', 'upi'].includes(params.method)) {
      backendParams.paymentMethod = params.method;
    }
    if (params?.startDate) {
      backendParams.from = params.startDate;
    }
    if (params?.endDate) {
      backendParams.to = params.endDate;
    }

    const response = await apiClient.get<BackendPaymentsResponse>('/payments', {
      params: backendParams,
    });

    const rawData: BackendPaymentItem[] = (response.data as any).data || response.data || [];
    const pagination = (response.data as any).pagination || { total: rawData.length };

    const fetchedRecords: PaymentRecord[] = rawData.map((p) => {
      let category: PaymentCategory = 'membership';
      let relatedEntityId = `MEM-${p.memberId || 'GUEST'}`;

      if (p.bookingId) {
        category = 'booking';
        relatedEntityId = `BK-${p.bookingId}`;
      } else if (p.orderId) {
        category = 'equipment_rental';
        relatedEntityId = `ORD-${p.orderId}`;
      } else if (p.barTabId) {
        category = 'bar_order';
        relatedEntityId = `TAB-${p.barTabId}`;
      }

      const method: LedgerPaymentMethod =
        p.paymentMethod === 'upi' || p.paymentMethod === 'card' || p.paymentMethod === 'cash'
          ? p.paymentMethod
          : 'cash';

      const recordId = String(p.id);
      const refundOverride = sessionRefunds.get(recordId);

      return {
        id: recordId,
        transactionRef: p.referenceNo || `TXN-${String(p.id).padStart(6, '0')}`,
        date: p.paidAt,
        amountPaise: p.amountPaise,
        category,
        relatedEntityId,
        memberName: p.memberName || (p.memberId ? `Member #${p.memberId}` : 'Club Guest'),
        memberPhone: '',
        method,
        status: refundOverride ? refundOverride.status : 'success',
        notes: refundOverride ? refundOverride.notes : p.notes || undefined,
        refundedAmountPaise: refundOverride ? refundOverride.refundedAmountPaise : undefined,
      };
    });

    let combined = [...sessionAddedPayments, ...fetchedRecords];

    if (params?.search) {
      const q = params.search.toLowerCase();
      combined = combined.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.transactionRef.toLowerCase().includes(q) ||
          p.memberName.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    if (params?.category && params.category !== 'all') {
      combined = combined.filter((p) => p.category === params.category);
    }

    if (params?.method && params.method !== 'all') {
      combined = combined.filter((p) => p.method === params.method);
    }

    if (params?.status && params.status !== 'all') {
      combined = combined.filter((p) => p.status === params.status);
    }

    const stats = calculateStats(combined);

    return {
      data: combined,
      total: pagination.total || combined.length,
      stats,
    };
  },

  // Record a payment directly into ledger
  recordPayment: async (payload: RecordPaymentPayload): Promise<PaymentRecord> => {
    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      amountPaise: payload.amountPaise,
      category: payload.category,
      relatedEntityId: payload.relatedEntityId,
      memberName: payload.memberName,
      memberPhone: payload.memberPhone,
      method: payload.method,
      status: 'success',
      notes: payload.notes,
    };
    sessionAddedPayments.unshift(newPayment);
    return newPayment;
  },

  // Refund payment
  refundPayment: async (payload: RefundPaymentPayload): Promise<PaymentRecord> => {
    sessionRefunds.set(payload.paymentId, {
      status: 'refunded',
      refundedAmountPaise: payload.amountPaise,
      notes: `Refunded: ${payload.reason}`,
    });

    return {
      id: payload.paymentId,
      transactionRef: `REF-${payload.paymentId}`,
      date: new Date().toISOString(),
      amountPaise: payload.amountPaise,
      category: 'membership',
      relatedEntityId: payload.paymentId,
      memberName: 'Member Refund',
      memberPhone: '',
      method: 'upi',
      status: 'refunded',
      notes: `Refunded: ${payload.reason}`,
      refundedAmountPaise: payload.amountPaise,
    };
  },
};

export default paymentService;
