import { apiClient } from './apiClient';
import { mockBarTables } from '@/mock/barTables';
import { mockBarTabs } from '@/mock/barTabs';
import { mockMenuItems } from '@/mock/menuItems';
import { mockMembers } from '@/mock/members';
import type {
  BarTable,
  BarTab,
  CreateBarTabPayload,
  AddBarTabItemPayload,
  SettleBarTabPayload,
  CreateBarTablePayload,
  UpdateBarTablePayload,
} from '@/types/bar';

// In-memory state for fallback
let localTables: BarTable[] = JSON.parse(JSON.stringify(mockBarTables));
let localTabs: BarTab[] = JSON.parse(JSON.stringify(mockBarTabs));

export const barService = {
  // BT-01: Get visual floor table layout & occupancy
  getTables: async (): Promise<BarTable[]> => {
    try {
      const response = await apiClient.get<BarTable[]>('/bar/tables');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return localTables;
    } catch {
      return localTables;
    }
  },

  // BT-02: Admin: create bar table
  createTable: async (payload: CreateBarTablePayload): Promise<BarTable> => {
    try {
      const response = await apiClient.post<BarTable>('/bar/tables', payload);
      return response.data;
    } catch {
      const newTable: BarTable = {
        id: localTables.length > 0 ? Math.max(...localTables.map((t) => Number(t.id))) + 1 : 1,
        tableNo: payload.tableNo,
        capacity: payload.capacity,
        isActive: payload.isActive ?? true,
        activeTab: null,
      };
      localTables.push(newTable);
      return newTable;
    }
  },

  // BT-03: Admin: update bar table
  updateTable: async (
    id: number | string,
    payload: UpdateBarTablePayload
  ): Promise<BarTable> => {
    try {
      const response = await apiClient.put<BarTable>(`/bar/tables/${id}`, payload);
      return response.data;
    } catch {
      const index = localTables.findIndex((t) => String(t.id) === String(id));
      if (index === -1) {
        throw new Error('Table not found');
      }
      localTables[index] = {
        ...localTables[index],
        ...payload,
      };
      return localTables[index];
    }
  },

  // TB-01: List all currently open tabs
  getOpenTabs: async (): Promise<BarTab[]> => {
    try {
      const response = await apiClient.get<BarTab[]>('/bar/tabs', {
        params: { status: 'open' },
      });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return localTabs.filter((tab) => tab.status === 'open');
    } catch {
      return localTabs.filter((tab) => tab.status === 'open');
    }
  },

  // TB-02: Get tab detail by ID
  getTabById: async (id: number | string): Promise<BarTab> => {
    try {
      const response = await apiClient.get<BarTab>(`/bar/tabs/${id}`);
      if (
        response.data &&
        typeof response.data === 'object' &&
        'id' in response.data &&
        Array.isArray((response.data as BarTab).items)
      ) {
        return response.data;
      }
      throw new Error('Invalid tab response');
    } catch {
      const tab = localTabs.find((t) => String(t.id) === String(id));
      if (!tab) {
        throw new Error('Tab not found');
      }
      return tab;
    }
  },


  // TB-03: Open a new bar tab
  openTab: async (payload: CreateBarTabPayload): Promise<BarTab> => {
    try {
      const response = await apiClient.post<BarTab>('/bar/tabs', payload);
      return response.data;
    } catch {
      const table = localTables.find((t) => String(t.id) === String(payload.barTableId));
      if (!table) {
        throw new Error('Selected table does not exist');
      }

      const member = payload.memberId
        ? mockMembers.find((m) => String(m.id) === String(payload.memberId))
        : null;

      const newTabId = localTabs.length > 0 ? Math.max(...localTabs.map((t) => Number(t.id))) + 1 : 101;
      const newTab: BarTab = {
        id: newTabId,
        barTableId: Number(table.id),
        tableNo: table.tableNo,
        memberId: member ? Number(member.id.replace(/\D/g, '') || 1) : null,
        memberName: member ? member.name : 'Walk-in Guest',
        memberTier: member ? (member.membershipPlan as string) : null,
        openedBy: payload.openedBy || 1,
        openedByName: 'Alex Mercer',
        status: 'open',
        openedAt: new Date().toISOString(),
        settledAt: null,
        notes: payload.notes || null,
        items: [],
        subtotalPaise: 0,
        discountPaise: 0,
        totalPaise: 0,
      };

      localTabs.unshift(newTab);
      // Link table activeTab
      table.activeTab = newTab;

      return newTab;
    }
  },

  // TB-04: Add item to bar tab
  addItemToTab: async (
    tabId: number | string,
    payload: AddBarTabItemPayload
  ): Promise<BarTab> => {
    try {
      const response = await apiClient.post<BarTab>(`/bar/tabs/${tabId}/items`, payload);
      return response.data;
    } catch {
      const tab = localTabs.find((t) => String(t.id) === String(tabId));
      if (!tab) throw new Error('Tab not found');

      const menuItem = mockMenuItems.find((m) => String(m.id) === String(payload.menuItemId));
      if (!menuItem) throw new Error('Menu item not found');

      const existingItem = tab.items.find(
        (i) => String(i.menuItemId) === String(payload.menuItemId)
      );

      if (existingItem) {
        existingItem.qty += payload.qty;
        existingItem.subtotalPaise = existingItem.qty * existingItem.unitPricePaise;
      } else {
        const newItemId = tab.items.length > 0 ? Math.max(...tab.items.map((i) => i.id)) + 1 : 1;
        tab.items.push({
          id: newItemId,
          tabId: Number(tab.id),
          menuItemId: Number(menuItem.id),
          name: menuItem.name,
          qty: payload.qty,
          unitPricePaise: menuItem.pricePaise,
          subtotalPaise: payload.qty * menuItem.pricePaise,
          createdAt: new Date().toISOString(),
        });
      }

      // Recompute totals
      tab.subtotalPaise = tab.items.reduce((acc, curr) => acc + curr.subtotalPaise, 0);
      const discountPct = tab.memberTier === 'VIP' ? 0.1 : tab.memberTier === 'Premium' ? 0.05 : 0;
      tab.discountPaise = Math.round(tab.subtotalPaise * discountPct);
      tab.totalPaise = tab.subtotalPaise - tab.discountPaise;

      // Update table reference
      const table = localTables.find((t) => Number(t.id) === tab.barTableId);
      if (table) {
        table.activeTab = tab;
      }

      return tab;
    }
  },

  // TB-05: Settle bar tab
  settleTab: async (
    tabId: number | string,
    payload: SettleBarTabPayload
  ): Promise<BarTab> => {
    try {
      const response = await apiClient.put<BarTab>(`/bar/tabs/${tabId}/settle`, payload);
      return response.data;
    } catch {
      const tab = localTabs.find((t) => String(t.id) === String(tabId));
      if (!tab) throw new Error('Tab not found');

      tab.status = 'settled';
      tab.settledAt = new Date().toISOString();
      tab.paymentMethod = payload.paymentMethod;
      if (payload.notes) {
        tab.notes = tab.notes ? `${tab.notes} | ${payload.notes}` : payload.notes;
      }

      // Unlink active tab from table
      const table = localTables.find((t) => Number(t.id) === tab.barTableId);
      if (table && table.activeTab?.id === tab.id) {
        table.activeTab = null;
      }

      return tab;
    }
  },

  // TB-06: Update item quantity in bar tab
  updateItemQty: async (
    tabId: number | string,
    itemId: number | string,
    delta: number
  ): Promise<BarTab> => {
    try {
      const response = await apiClient.patch<BarTab>(`/bar/tabs/${tabId}/items/${itemId}`, { delta });
      if (
        response.data &&
        typeof response.data === 'object' &&
        'id' in response.data &&
        Array.isArray((response.data as BarTab).items)
      ) {
        return response.data;
      }
      throw new Error('Invalid tab response');
    } catch {
      const tab = localTabs.find((t) => String(t.id) === String(tabId));
      if (!tab) throw new Error('Tab not found');

      const item = tab.items.find((i) => String(i.id) === String(itemId));
      if (!item) throw new Error('Item not found on tab');

      const newQty = item.qty + delta;
      if (newQty < 1) {
        throw new Error('Quantity cannot be less than 1');
      }

      item.qty = newQty;
      item.subtotalPaise = item.qty * item.unitPricePaise;

      // Recompute totals
      tab.subtotalPaise = tab.items.reduce((acc, curr) => acc + curr.subtotalPaise, 0);
      const discountPct = tab.memberTier === 'VIP' ? 0.1 : tab.memberTier === 'Premium' ? 0.05 : 0;
      tab.discountPaise = Math.round(tab.subtotalPaise * discountPct);
      tab.totalPaise = tab.subtotalPaise - tab.discountPaise;

      // Update table reference
      const table = localTables.find((t) => Number(t.id) === tab.barTableId);
      if (table) {
        table.activeTab = tab;
      }

      return tab;
    }
  },
};
