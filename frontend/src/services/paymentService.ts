import { apiClient } from './apiClient';
import { mockPayments } from '@/mock/payments';
import type {
  PaymentRecord,
  PaymentQueryParams,
  RecordPaymentPayload,
  RefundPaymentPayload,
  PaymentSummaryStats,
} from '@/types/payments';

let paymentsStore = [...mockPayments];

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

export const paymentService = {
  // PM-01: Unified payment ledger with filter, search, pagination, and stats
  getPayments: async (
    params?: PaymentQueryParams
  ): Promise<{ data: PaymentRecord[]; total: number; stats: PaymentSummaryStats }> => {
    try {
      const response = await apiClient.get<{
        data: PaymentRecord[];
        total: number;
        stats: PaymentSummaryStats;
      }>('/payments', { params });
      return response.data;
    } catch {
      let filtered = [...paymentsStore];

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.id.toLowerCase().includes(q) ||
            p.transactionRef.toLowerCase().includes(q) ||
            p.memberName.toLowerCase().includes(q) ||
            p.memberPhone.includes(q) ||
            (p.notes && p.notes.toLowerCase().includes(q))
        );
      }

      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((p) => p.category === params.category);
      }

      if (params?.method && params.method !== 'all') {
        filtered = filtered.filter((p) => p.method === params.method);
      }

      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((p) => p.status === params.status);
      }

      const stats = calculateStats(filtered);
      return {
        data: filtered,
        total: filtered.length,
        stats,
      };
    }
  },

  // Record a payment directly into ledger
  recordPayment: async (payload: RecordPaymentPayload): Promise<PaymentRecord> => {
    try {
      const response = await apiClient.post<PaymentRecord>('/payments', payload);
      return response.data;
    } catch {
      const newPayment: PaymentRecord = {
        id: `PAY-${paymentsStore.length + 1001}`,
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
      paymentsStore.unshift(newPayment);
      return newPayment;
    }
  },

  // Refund payment
  refundPayment: async (payload: RefundPaymentPayload): Promise<PaymentRecord> => {
    try {
      const response = await apiClient.post<PaymentRecord>(
        `/payments/${payload.paymentId}/refund`,
        payload
      );
      return response.data;
    } catch {
      const index = paymentsStore.findIndex((p) => p.id === payload.paymentId);
      if (index === -1) {
        throw new Error('Payment record not found');
      }
      paymentsStore[index] = {
        ...paymentsStore[index],
        status: 'refunded',
        refundedAmountPaise: payload.amountPaise,
        notes: `${paymentsStore[index].notes ? paymentsStore[index].notes + ' | ' : ''}Refunded: ${payload.reason}`,
      };
      return paymentsStore[index];
    }
  },
};

export default paymentService;
