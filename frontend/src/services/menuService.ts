import { apiClient } from './apiClient';
import { mockMenuItems } from '@/mock/menuItems';
import type {
  MenuItem,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
  MenuItemQueryParams,
} from '@/types/menu';

let localMenuItems: MenuItem[] = JSON.parse(JSON.stringify(mockMenuItems));

export const menuService = {
  // MI-01: Get menu catalog with filters
  getMenuItems: async (params?: MenuItemQueryParams): Promise<MenuItem[]> => {
    try {
      const response = await apiClient.get<MenuItem[]>('/menu', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return filterLocalMenu(params);
    } catch {
      return filterLocalMenu(params);
    }
  },

  // MI-02: Get menu item by ID
  getMenuItemById: async (id: number | string): Promise<MenuItem> => {
    try {
      const response = await apiClient.get<MenuItem>(`/menu/${id}`);
      return response.data;
    } catch {
      const item = localMenuItems.find((m) => String(m.id) === String(id));
      if (!item) throw new Error('Menu item not found');
      return item;
    }
  },

  // MI-03: Create new menu item
  createMenuItem: async (payload: CreateMenuItemPayload): Promise<MenuItem> => {
    try {
      const response = await apiClient.post<MenuItem>('/menu', payload);
      return response.data;
    } catch {
      const newId = localMenuItems.length > 0 ? Math.max(...localMenuItems.map((m) => m.id)) + 1 : 1;
      const newItem: MenuItem = {
        id: newId,
        name: payload.name,
        category: payload.category,
        description: payload.description || null,
        pricePaise: payload.pricePaise,
        stockQty: payload.stockQty,
        lowStockThreshold: payload.lowStockThreshold ?? 5,
        isAvailable: payload.isAvailable ?? true,
        imageUrl: payload.imageUrl || null,
        createdAt: new Date().toISOString(),
      };
      localMenuItems.unshift(newItem);
      return newItem;
    }
  },

  // MI-04: Update menu item
  updateMenuItem: async (
    id: number | string,
    payload: UpdateMenuItemPayload
  ): Promise<MenuItem> => {
    try {
      const response = await apiClient.put<MenuItem>(`/menu/${id}`, payload);
      return response.data;
    } catch {
      const index = localMenuItems.findIndex((m) => String(m.id) === String(id));
      if (index === -1) throw new Error('Menu item not found');

      localMenuItems[index] = {
        ...localMenuItems[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return localMenuItems[index];
    }
  },

  // Toggle availability shortcut
  toggleAvailability: async (id: number | string): Promise<MenuItem> => {
    try {
      const response = await apiClient.patch<MenuItem>(`/menu/${id}/toggle-availability`);
      return response.data;
    } catch {
      const index = localMenuItems.findIndex((m) => String(m.id) === String(id));
      if (index === -1) throw new Error('Menu item not found');

      localMenuItems[index].isAvailable = !localMenuItems[index].isAvailable;
      return localMenuItems[index];
    }
  },

  // Delete menu item
  deleteMenuItem: async (id: number | string): Promise<boolean> => {
    try {
      await apiClient.delete(`/menu/${id}`);
      return true;
    } catch {
      const index = localMenuItems.findIndex((m) => String(m.id) === String(id));
      if (index !== -1) {
        localMenuItems.splice(index, 1);
      }
      return true;
    }
  },
};

function filterLocalMenu(params?: MenuItemQueryParams): MenuItem[] {
  let result = [...localMenuItems];
  if (!params) return result;

  if (params.category && params.category !== 'all') {
    result = result.filter(
      (m) => m.category.toLowerCase() === params.category!.toLowerCase()
    );
  }
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
    );
  }
  if (typeof params.isAvailable === 'boolean') {
    result = result.filter((m) => m.isAvailable === params.isAvailable);
  }

  return result;
}
