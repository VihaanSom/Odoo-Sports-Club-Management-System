import { apiClient } from './apiClient';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  OrderQueryParams,
  OrderItem,
} from '@/types/orders';

/**
 * Normalizes backend order responses into frontend Order representation.
 * Handles both backend contract (discountAmountPaise, totalAmountPaise)
 * and frontend legacy format (discountPaise, totalPaise, orderNumber, memberName).
 */
export function normalizeOrder(order: any): Order {
  const items: OrderItem[] = (order.items || []).map((item: any) => ({
    id: item.id,
    orderId: item.orderId ?? order.id,
    itemType: item.itemType || (item.equipmentId ? 'equipment' : 'menu'),
    itemId: item.itemId ?? item.equipmentId ?? item.menuItemId ?? item.id,
    name: item.name || item.equipmentName || 'Item',
    qty: item.qty,
    unitPricePaise:
      item.unitPricePaise ?? Math.round(Number(item.unitPrice || 0) * 100),
    subtotalPaise:
      item.subtotalPaise ?? Math.round(Number(item.subtotal || 0) * 100),
    imageUrl: item.imageUrl ?? null,
  }));

  const subtotalPaise =
    order.subtotalPaise ?? Math.round(Number(order.subtotal || 0) * 100);
  const discountPaise =
    order.discountPaise ??
    order.discountAmountPaise ??
    Math.round(Number(order.discountAmount || 0) * 100);
  const totalPaise =
    order.totalPaise ??
    order.totalAmountPaise ??
    Math.round(Number(order.totalAmount || 0) * 100);

  const memberName =
    order.memberName ??
    (order.member
      ? `${order.member.firstName || ''} ${order.member.lastName || ''}`.trim()
      : null);

  const memberEmail = order.memberEmail ?? order.member?.email ?? null;
  const memberPhone = order.memberPhone ?? order.member?.phone ?? null;

  return {
    id: order.id,
    orderNumber: order.orderNumber || `ORD-2026-${order.id}`,
    memberId: order.memberId ?? null,
    memberName,
    memberEmail,
    memberPhone,
    orderType: order.orderType,
    status: order.status,
    paymentMethod: order.paymentMethod ?? 'cash',
    subtotalPaise,
    discountPaise,
    totalPaise,
    deliveryAddress: order.deliveryAddress ?? null,
    notes: order.notes ?? null,
    items,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export const orderService = {
  // OR-01: Get orders ledger with filters and pagination
  getOrders: async (
    params?: OrderQueryParams
  ): Promise<{ data: Order[]; total: number }> => {
    const cleanParams: Record<string, any> = {
      page: params?.page || 1,
      pageSize: params?.limit || 20,
    };

    if (params?.type && params.type !== 'all') {
      cleanParams.orderType = params.type;
    }
    if (params?.status && params.status !== 'all') {
      cleanParams.status = params.status;
    }
    if (params?.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params?.startDate) {
      cleanParams.from = params.startDate;
    }
    if (params?.endDate) {
      cleanParams.to = params.endDate;
    }

    const response = await apiClient.get<PaginatedApiResponse<any>>('/orders', {
      params: cleanParams,
    });

    const rawOrders = response.data?.data || (Array.isArray(response.data) ? (response.data as unknown as any[]) : []);
    const total =
      response.data?.pagination?.total ?? (Array.isArray(rawOrders) ? rawOrders.length : 0);

    return {
      data: rawOrders.map(normalizeOrder),
      total,
    };
  },

  // OR-02: Get order detail by ID
  getOrderById: async (id: number | string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<any>>(`/orders/${id}`);
    const rawOrder = response.data?.data || (response.data as unknown as any);
    return normalizeOrder(rawOrder);
  },

  // OR-03: Place new order (POS checkout)
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const body = {
      memberId: payload.memberId ? Number(payload.memberId) : null,
      orderType: payload.orderType,
      paymentMethod: payload.paymentMethod || 'cash',
      deliveryAddress: payload.deliveryAddress || null,
      notes: payload.notes || null,
      items: payload.items.map((item) => ({
        equipmentId:
          (item as any).equipmentId || (item.itemType === 'equipment' ? item.itemId : undefined),
        menuItemId:
          (item as any).menuItemId || (item.itemType === 'menu' ? item.itemId : undefined),
        qty: item.qty,
      })),
    };

    const response = await apiClient.post<ApiResponse<any>>('/orders', body);
    const rawOrder = response.data?.data || (response.data as unknown as any);
    return normalizeOrder(rawOrder);
  },

  // OR-04: Update order status (state machine transition)
  updateOrderStatus: async (
    id: number | string,
    payload: UpdateOrderStatusPayload
  ): Promise<Order> => {
    const response = await apiClient.put<ApiResponse<any>>(`/orders/${id}/status`, {
      status: payload.status,
    });
    const rawOrder = response.data?.data || (response.data as unknown as any);
    return normalizeOrder(rawOrder);
  },
};
