import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { Equipment } from '@/types/models';
import type {
  EquipmentItem,
  CreateEquipmentPayload,
  UpdateEquipmentPayload,
  AdjustStockPayload,
} from '@/types/equipment';

/**
 * Normalizes EquipmentItem to legacy Equipment interface for EquipmentPage and components.
 */
export const formatLegacyEquipment = (item: EquipmentItem): Equipment => ({
  id: item.id,
  name: item.name,
  category: item.category,
  quantityTotal: item.stockQty,
  quantityAvailable: item.stockQty,
  stockQty: item.stockQty,
  condition: (item.condition || 'Excellent') as any,
  pricePaise: item.pricePaise,
  rentalRate: Math.round((item.rentalRatePaise || Math.round(item.pricePaise * 0.05)) / 100),
});

export const equipmentService = {
  // Legacy support for existing equipment page
  getAll: async (): Promise<Equipment[]> => {
    const response = await apiClient.get<ApiResponse<EquipmentItem[]>>('/equipment', {
      params: { pageSize: 100 },
    });
    const items = response.data?.data || (Array.isArray(response.data) ? (response.data as unknown as EquipmentItem[]) : []);
    return items.map(formatLegacyEquipment);
  },

  // EQ-01: List equipment items with filters
  getEquipmentList: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<EquipmentItem[]> => {
    const cleanParams: Record<string, any> = {};
    if (params?.category && params.category !== 'all' && params.category !== 'All') {
      cleanParams.category = params.category.toLowerCase();
    }
    if (params?.search) {
      cleanParams.search = params.search;
    }
    if (params?.page) cleanParams.page = params.page;
    if (params?.pageSize) cleanParams.pageSize = params.pageSize;

    const response = await apiClient.get<ApiResponse<EquipmentItem[]>>('/equipment', {
      params: cleanParams,
    });
    return response.data?.data || (Array.isArray(response.data) ? (response.data as unknown as EquipmentItem[]) : []);
  },

  // EQ-02: Get equipment item by ID
  getEquipmentById: async (id: number | string): Promise<EquipmentItem> => {
    const response = await apiClient.get<ApiResponse<EquipmentItem>>(`/equipment/${id}`);
    return response.data?.data || (response.data as unknown as EquipmentItem);
  },

  // EQ-03: Create equipment item
  createEquipment: async (payload: CreateEquipmentPayload): Promise<EquipmentItem> => {
    const cleanPayload = {
      name: payload.name,
      category: payload.category.toLowerCase(),
      brand: payload.brand || null,
      description: payload.description || null,
      pricePaise: payload.pricePaise,
      stockQty: payload.stockQty,
      lowStockThreshold: payload.lowStockThreshold ?? 5,
      imageUrl: payload.imageUrl || null,
    };
    const response = await apiClient.post<ApiResponse<EquipmentItem>>('/equipment', cleanPayload);
    return response.data?.data || (response.data as unknown as EquipmentItem);
  },

  // EQ-04: Update equipment item
  updateEquipment: async (
    id: number | string,
    payload: UpdateEquipmentPayload
  ): Promise<EquipmentItem> => {
    const cleanPayload: Record<string, any> = {};
    if (payload.name !== undefined) cleanPayload.name = payload.name;
    if (payload.category !== undefined) cleanPayload.category = payload.category.toLowerCase();
    if (payload.brand !== undefined) cleanPayload.brand = payload.brand;
    if (payload.description !== undefined) cleanPayload.description = payload.description;
    if (payload.pricePaise !== undefined) cleanPayload.pricePaise = payload.pricePaise;
    if (payload.stockQty !== undefined) cleanPayload.stockQty = payload.stockQty;
    if (payload.lowStockThreshold !== undefined) cleanPayload.lowStockThreshold = payload.lowStockThreshold;
    if (payload.isActive !== undefined) cleanPayload.isActive = payload.isActive;
    if (payload.imageUrl !== undefined) cleanPayload.imageUrl = payload.imageUrl;

    const response = await apiClient.put<ApiResponse<EquipmentItem>>(`/equipment/${id}`, cleanPayload);
    return response.data?.data || (response.data as unknown as EquipmentItem);
  },

  // EQ-05: Adjust stock level with reason
  adjustStock: async (
    id: number | string,
    payload: AdjustStockPayload
  ): Promise<EquipmentItem> => {
    const response = await apiClient.post<ApiResponse<EquipmentItem>>(
      `/equipment/${id}/adjust-stock`,
      payload
    );
    return response.data?.data || (response.data as unknown as EquipmentItem);
  },

  // EQ-06: Low stock alerts
  getLowStockAlerts: async (): Promise<EquipmentItem[]> => {
    const response = await apiClient.get<ApiResponse<EquipmentItem[]>>('/equipment/alerts/low-stock');
    return response.data?.data || (Array.isArray(response.data) ? (response.data as unknown as EquipmentItem[]) : []);
  },

  rentItem: async (id: number | string): Promise<EquipmentItem> => {
    return equipmentService.adjustStock(id, { adjustmentQty: -1, reason: 'Member rental' });
  },

  returnItem: async (id: number | string): Promise<EquipmentItem> => {
    return equipmentService.adjustStock(id, { adjustmentQty: 1, reason: 'Return to stock' });
  },
};
