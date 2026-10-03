export type PaymentCategory =
  | 'membership'
  | 'booking'
  | 'bar_order'
  | 'equipment_rental';

export type LedgerPaymentMethod = 'upi' | 'card' | 'cash' | 'netbanking';

export type PaymentStatusType = 'success' | 'failed' | 'pending' | 'refunded';

export interface PaymentRecord {
  id: string;
  transactionRef: string;
  date: string; // ISO date
  amountPaise: number;
  category: PaymentCategory;
  relatedEntityId: string;
  memberName: string;
  memberPhone: string;
  method: LedgerPaymentMethod;
  status: PaymentStatusType;
  notes?: string;
  refundedAmountPaise?: number;
}

export interface PaymentQueryParams {
  search?: string;
  category?: PaymentCategory | 'all';
  method?: LedgerPaymentMethod | 'all';
  status?: PaymentStatusType | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface RecordPaymentPayload {
  amountPaise: number;
  category: PaymentCategory;
  relatedEntityId: string;
  memberName: string;
  memberPhone: string;
  method: LedgerPaymentMethod;
  notes?: string;
}

export interface RefundPaymentPayload {
  paymentId: string;
  amountPaise: number;
  reason: string;
}

export interface PaymentSummaryStats {
  totalVolumePaise: number;
  successfulCount: number;
  pendingCount: number;
  refundedVolumePaise: number;
  upiPercentage: number;
  cardPercentage: number;
  cashPercentage: number;
}
