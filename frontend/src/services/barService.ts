import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  BarTable,
  BarTab,
  BarTabItem,
  CreateBarTabPayload,
  AddBarTabItemPayload,
  SettleBarTabPayload,
  CreateBarTablePayload,
  UpdateBarTablePayload,
} from '@/types/bar';

/**
 * Normalizes backend tab response (TabDetailResponse / SettledTabResponse)
 * into the frontend BarTab interface.
 */
export function normalizeBarTab(raw: any): BarTab {
  if (!raw) {
    throw new Error('Invalid tab response');
  }

  const items: BarTabItem[] = (raw.items || []).map((it: any) => ({
    id: it.id,
    tabId: it.tabId ?? raw.id,
    menuItemId: it.menuItemId,
    name: it.name ?? it.menuItemName ?? (it.menuItem?.name || `Item #${it.menuItemId}`),
    qty: it.qty,
    unitPricePaise: it.unitPricePaise ?? Math.round(Number(it.unitPrice ?? 0) * 100),
    subtotalPaise: it.subtotalPaise ?? Math.round(Number(it.subtotal ?? 0) * 100),
    createdAt: it.createdAt,
  }));

  const subtotalPaise =
    raw.subtotalPaise ??
    items.reduce((acc, item) => acc + item.subtotalPaise, 0);

  const discountPaise = raw.discountPaise ?? 0;
  const totalPaise =
    raw.totalPaise ??
    raw.runningTotalPaise ??
    Math.max(0, subtotalPaise - discountPaise);

  return {
    id: Number(raw.id),
    barTableId: Number(raw.barTableId ?? raw.table?.id ?? 0),
    tableNo: raw.tableNo ?? (raw.table ? raw.table.tableNo : undefined),
    memberId: raw.memberId ? Number(raw.memberId) : null,
    memberName:
      raw.memberName ??
      (raw.member ? `${raw.member.firstName} ${raw.member.lastName}`.trim() : null),
    memberTier: raw.memberTier ?? raw.member?.tier ?? null,
    openedBy: Number(raw.openedBy ?? 0),
    openedByName:
      raw.openedByName ??
      (raw.staff ? `${raw.staff.firstName} ${raw.staff.lastName}`.trim() : undefined),
    status: raw.status ?? 'open',
    openedAt: raw.openedAt || new Date().toISOString(),
    settledAt: raw.settledAt ?? null,
    notes: raw.notes ?? null,
    items,
    itemCount: raw.itemCount ?? items.reduce((acc, i) => acc + i.qty, 0),
    subtotalPaise,
    discountPaise,
    totalPaise,
    paymentMethod: raw.paymentMethod ?? raw.payment?.paymentMethod ?? null,
  };
}

/**
 * Normalizes backend BarTableResponse into frontend BarTable interface.
 */
export function normalizeBarTable(raw: any): BarTable {
  if (!raw) {
    throw new Error('Invalid bar table response');
  }

  let activeTab: BarTab | null = null;
  if (raw.currentTab) {
    activeTab = {
      id: Number(raw.currentTab.tabId),
      barTableId: Number(raw.id),
      tableNo: raw.tableNo,
      status: raw.currentTab.status,
      openedAt: raw.currentTab.openedAt,
      items: [],
      itemCount: raw.currentTab.itemCount,
      subtotalPaise: raw.currentTab.runningTotalPaise,
      discountPaise: 0,
      totalPaise: raw.currentTab.runningTotalPaise,
      openedBy: 0,
    };
  } else if (raw.activeTab) {
    activeTab = normalizeBarTab(raw.activeTab);
  } else if (Array.isArray(raw.tabs) && raw.tabs.length > 0) {
    activeTab = normalizeBarTab(raw.tabs[0]);
  }

  return {
    id: Number(raw.id),
    tableNo: raw.tableNo,
    capacity: Number(raw.capacity ?? 4),
    isActive: raw.isActive ?? true,
    activeTab,
  };
}

export const barService = {
  // BT-01: Get visual floor table layout & occupancy
  getTables: async (): Promise<BarTable[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/bar/tables');
    const rawList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
    return rawList.map(normalizeBarTable);
  },

  // BT-02: Admin: create bar table
  createTable: async (payload: CreateBarTablePayload): Promise<BarTable> => {
    const cleanPayload = {
      tableNo: payload.tableNo.trim(),
      capacity: Number(payload.capacity),
      isActive: payload.isActive ?? true,
    };
    const response = await apiClient.post<ApiResponse<any>>('/bar/tables', cleanPayload);
    const rawData = response.data?.data || response.data;
    return normalizeBarTable(rawData);
  },

  // BT-03: Admin: update bar table
  updateTable: async (
    id: number | string,
    payload: UpdateBarTablePayload
  ): Promise<BarTable> => {
    const cleanPayload: Record<string, any> = {};
    if (payload.tableNo !== undefined) cleanPayload.tableNo = payload.tableNo.trim();
    if (payload.capacity !== undefined) cleanPayload.capacity = Number(payload.capacity);
    if (payload.isActive !== undefined) cleanPayload.isActive = payload.isActive;

    const response = await apiClient.put<ApiResponse<any>>(`/bar/tables/${id}`, cleanPayload);
    const rawData = response.data?.data || response.data;
    return normalizeBarTable(rawData);
  },

  // TB-01: List all currently open tabs
  getOpenTabs: async (): Promise<BarTab[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/bar/tabs', {
      params: { status: 'open' },
    });
    const rawList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
    return rawList.map(normalizeBarTab);
  },

  // TB-02: Get tab detail by ID
  getTabById: async (id: number | string): Promise<BarTab> => {
    const response = await apiClient.get<ApiResponse<any>>(`/bar/tabs/${id}`);
    const rawData = response.data?.data || response.data;
    return normalizeBarTab(rawData);
  },

  // TB-03: Open a new bar tab
  openTab: async (payload: CreateBarTabPayload): Promise<BarTab> => {
    const cleanPayload = {
      barTableId: Number(payload.barTableId),
      memberId: payload.memberId ? Number(payload.memberId) : null,
      notes: payload.notes?.trim() || null,
    };
    const response = await apiClient.post<ApiResponse<any>>('/bar/tabs', cleanPayload);
    const rawData = response.data?.data || response.data;
    return normalizeBarTab(rawData);
  },

  // TB-04: Add item to bar tab
  addItemToTab: async (
    tabId: number | string,
    payload: AddBarTabItemPayload
  ): Promise<BarTab> => {
    const requestBody = {
      items: [
        {
          menuItemId: Number(payload.menuItemId),
          qty: Number(payload.qty),
        },
      ],
    };
    const response = await apiClient.post<ApiResponse<any>>(`/bar/tabs/${tabId}/items`, requestBody);
    const rawData = response.data?.data || response.data;
    return normalizeBarTab(rawData);
  },

  // TB-05: Settle bar tab
  settleTab: async (
    tabId: number | string,
    payload: SettleBarTabPayload
  ): Promise<BarTab> => {
    const requestBody = {
      paymentMethod: payload.paymentMethod,
      referenceNo: payload.notes?.trim() || undefined,
    };
    const response = await apiClient.put<ApiResponse<any>>(`/bar/tabs/${tabId}/settle`, requestBody);
    const rawData = response.data?.data || response.data;
    return normalizeBarTab(rawData);
  },

  // TB-06: Update item quantity in bar tab
  updateItemQty: async (
    tabId: number | string,
    itemId: number | string,
    delta: number
  ): Promise<BarTab> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/bar/tabs/${tabId}/items/${itemId}`,
      { delta: Number(delta) }
    );
    const rawData = response.data?.data || response.data;
    return normalizeBarTab(rawData);
  },
};

export default barService;
