import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  MenuItem,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
  MenuItemQueryParams,
} from '@/types/menu';

export const menuService = {
  // MI-01: Get menu catalog with filters
  getMenuItems: async (params?: MenuItemQueryParams): Promise<MenuItem[]> => {
    const cleanParams: Record<string, any> = {
      pageSize: 100,
    };
    if (params?.category && params.category !== 'all') {
      cleanParams.category = params.category.toLowerCase();
    }
    if (params?.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (typeof params?.isAvailable === 'boolean') {
      cleanParams.isAvailable = params.isAvailable;
    }

    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu-items', {
      params: cleanParams,
    });
    return response.data?.data || (Array.isArray(response.data) ? (response.data as unknown as MenuItem[]) : []);
  },

  // MI-02: Get menu item by ID
  getMenuItemById: async (id: number | string): Promise<MenuItem> => {
    const response = await apiClient.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
    return response.data?.data || (response.data as unknown as MenuItem);
  },

  // MI-03: Create new menu item
  createMenuItem: async (payload: CreateMenuItemPayload): Promise<MenuItem> => {
    const cleanPayload = {
      name: payload.name.trim(),
      category: payload.category.toLowerCase(),
      description: payload.description ? payload.description.trim() : null,
      pricePaise: Number(payload.pricePaise),
      stockQty: Number(payload.stockQty),
      lowStockThreshold: payload.lowStockThreshold ?? 5,
      isAvailable: payload.isAvailable ?? true,
      imageUrl: payload.imageUrl ? payload.imageUrl.trim() : null,
    };
    const response = await apiClient.post<ApiResponse<MenuItem>>('/menu-items', cleanPayload);
    return response.data?.data || (response.data as unknown as MenuItem);
  },

  // MI-04: Update menu item
  updateMenuItem: async (
    id: number | string,
    payload: UpdateMenuItemPayload
  ): Promise<MenuItem> => {
    const cleanPayload: Record<string, any> = {};
    if (payload.name !== undefined) cleanPayload.name = payload.name.trim();
    if (payload.category !== undefined) cleanPayload.category = payload.category.toLowerCase();
    if (payload.description !== undefined) cleanPayload.description = payload.description ? payload.description.trim() : null;
    if (payload.pricePaise !== undefined) cleanPayload.pricePaise = Number(payload.pricePaise);
    if (payload.stockQty !== undefined) cleanPayload.stockQty = Number(payload.stockQty);
    if (payload.lowStockThreshold !== undefined) cleanPayload.lowStockThreshold = Number(payload.lowStockThreshold);
    if (payload.isAvailable !== undefined) cleanPayload.isAvailable = payload.isAvailable;
    if (payload.imageUrl !== undefined) cleanPayload.imageUrl = payload.imageUrl ? payload.imageUrl.trim() : null;

    const response = await apiClient.put<ApiResponse<MenuItem>>(`/menu-items/${id}`, cleanPayload);
    return response.data?.data || (response.data as unknown as MenuItem);
  },

  // MI-05: Toggle availability shortcut
  toggleAvailability: async (id: number | string): Promise<MenuItem> => {
    const response = await apiClient.patch<ApiResponse<MenuItem>>(`/menu-items/${id}/toggle-availability`);
    return response.data?.data || (response.data as unknown as MenuItem);
  },

  // MI-06: Delete menu item
  deleteMenuItem: async (id: number | string): Promise<boolean> => {
    await apiClient.delete(`/menu-items/${id}`);
    return true;
  },
};
