import type { PaymentMethod } from './enums';

export type OrderType = 'in_store' | 'online' | 'bar';
export type OrderStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';

export interface OrderItem {
  id: number;
  orderId?: number;
  itemType: 'equipment' | 'menu';
  itemId: number;
  name: string;
  qty: number;
  unitPricePaise: number;
  subtotalPaise: number;
  imageUrl?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  memberId?: number | null;
  memberName?: string | null;
  memberPhone?: string | null;
  memberEmail?: string | null;
  orderType: OrderType;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | string | null;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  deliveryAddress?: string | null;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  memberId?: number | null;
  orderType: OrderType;
  paymentMethod?: PaymentMethod | string;
  deliveryAddress?: string;
  notes?: string;
  items: Array<{
    itemType: 'equipment' | 'menu';
    itemId: number;
    name: string;
    qty: number;
    unitPricePaise: number;
    imageUrl?: string | null;
  }>;
  discountPaise?: number;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  notes?: string;
}

export interface OrderQueryParams {
  type?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
