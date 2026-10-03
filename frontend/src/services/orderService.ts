import { apiClient } from './apiClient';
import { mockOrders } from '@/mock/orders';
import { mockMembers } from '@/mock/members';
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  OrderQueryParams,
  OrderItem,
} from '@/types/orders';

let localOrders: Order[] = JSON.parse(JSON.stringify(mockOrders));

export const orderService = {
  // OR-01: Get orders ledger with filters and pagination
  getOrders: async (
    params?: OrderQueryParams
  ): Promise<{ data: Order[]; total: number }> => {
    try {
      const response = await apiClient.get<{
        data: Order[];
        total?: number;
      }>('/orders', { params });
      if (response.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          total: response.data.total ?? response.data.data.length,
        };
      }
      if (Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length };
      }
      return filterLocalOrders(params);
    } catch {
      return filterLocalOrders(params);
    }
  },

  // OR-02: Get order detail by ID
  getOrderById: async (id: number | string): Promise<Order> => {
    try {
      const response = await apiClient.get<Order>(`/orders/${id}`);
      return response.data;
    } catch {
      const order = localOrders.find((o) => String(o.id) === String(id));
      if (!order) throw new Error('Order not found');
      return order;
    }
  },

  // OR-03: Place new order (POS checkout)
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    try {
      const response = await apiClient.post<Order>('/orders', payload);
      return response.data;
    } catch {
      const nextId = localOrders.length > 0 ? Math.max(...localOrders.map((o) => o.id)) + 1 : 1001;
      const orderNum = `ORD-2026-${nextId}`;

      const member = payload.memberId
        ? mockMembers.find((m) => String(m.id) === String(payload.memberId))
        : null;

      const subtotalPaise = payload.items.reduce(
        (sum, item) => sum + item.qty * item.unitPricePaise,
        0
      );

      const discountPaise =
        payload.discountPaise ??
        (member?.membershipPlan === 'VIP'
          ? Math.round(subtotalPaise * 0.1)
          : member?.membershipPlan === 'Premium'
          ? Math.round(subtotalPaise * 0.05)
          : 0);

      const totalPaise = subtotalPaise - discountPaise;

      const items: OrderItem[] = payload.items.map((item, idx) => ({
        id: nextId * 10 + idx + 1,
        orderId: nextId,
        itemType: item.itemType,
        itemId: item.itemId,
        name: item.name,
        qty: item.qty,
        unitPricePaise: item.unitPricePaise,
        subtotalPaise: item.qty * item.unitPricePaise,
        imageUrl: item.imageUrl || null,
      }));

      const newOrder: Order = {
        id: nextId,
        orderNumber: orderNum,
        memberId: member ? Number(member.id.replace(/\D/g, '') || 1) : null,
        memberName: member ? member.name : 'Walk-in Customer',
        memberEmail: member ? member.email : null,
        memberPhone: member ? member.phone : null,
        orderType: payload.orderType,
        status: 'confirmed',
        paymentMethod: payload.paymentMethod || 'cash',
        subtotalPaise,
        discountPaise,
        totalPaise,
        deliveryAddress: payload.deliveryAddress || null,
        notes: payload.notes || null,
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localOrders.unshift(newOrder);
      return newOrder;
    }
  },

  // OR-04: Update order status
  updateOrderStatus: async (
    id: number | string,
    payload: UpdateOrderStatusPayload
  ): Promise<Order> => {
    try {
      const response = await apiClient.put<Order>(`/orders/${id}/status`, payload);
      return response.data;
    } catch {
      const index = localOrders.findIndex((o) => String(o.id) === String(id));
      if (index === -1) throw new Error('Order not found');

      localOrders[index] = {
        ...localOrders[index],
        status: payload.status,
        notes: payload.notes
          ? `${localOrders[index].notes ? `${localOrders[index].notes} | ` : ''}${payload.notes}`
          : localOrders[index].notes,
        updatedAt: new Date().toISOString(),
      };
      return localOrders[index];
    }
  },
};

function filterLocalOrders(params?: OrderQueryParams): { data: Order[]; total: number } {
  let result = [...localOrders];
  if (!params) return { data: result, total: result.length };

  if (params.type && params.type !== 'all') {
    result = result.filter((o) => o.orderType.toLowerCase() === params.type!.toLowerCase());
  }
  if (params.status && params.status !== 'all') {
    result = result.filter((o) => o.status.toLowerCase() === params.status!.toLowerCase());
  }
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.memberName && o.memberName.toLowerCase().includes(q)) ||
        (o.memberEmail && o.memberEmail.toLowerCase().includes(q))
    );
  }

  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const paginated = result.slice(startIndex, startIndex + limit);

  return { data: paginated, total: result.length };
}
