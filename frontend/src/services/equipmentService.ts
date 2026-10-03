import { apiClient } from './apiClient';
import { mockEquipment, mockEquipmentItems } from '@/mock/equipment';
import type { Equipment } from '@/types/models';
import type {
  EquipmentItem,
  CreateEquipmentPayload,
  UpdateEquipmentPayload,
  AdjustStockPayload,
} from '@/types/equipment';

let localEquipmentItems: EquipmentItem[] = JSON.parse(JSON.stringify(mockEquipmentItems));

export const equipmentService = {
  // Legacy support for existing equipment page
  getAll: async (): Promise<Equipment[]> => {
    try {
      const response = await apiClient.get<Equipment[]>('/equipment');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return mockEquipment;
    } catch {
      return mockEquipment;
    }
  },

  rentItem: async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(`/equipment/${id}/rent`);
      return true;
    } catch {
      return true;
    }
  },

  returnItem: async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(`/equipment/${id}/return`);
      return true;
    } catch {
      return true;
    }
  },

  // EQ-01: List equipment items with filters
  getEquipmentList: async (params?: {
    category?: string;
    search?: string;
  }): Promise<EquipmentItem[]> => {
    try {
      const response = await apiClient.get<EquipmentItem[]>('/equipment', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return filterLocalEquipment(params);
    } catch {
      return filterLocalEquipment(params);
    }
  },

  // EQ-02: Get equipment item by ID
  getEquipmentById: async (id: number | string): Promise<EquipmentItem> => {
    try {
      const response = await apiClient.get<EquipmentItem>(`/equipment/${id}`);
      return response.data;
    } catch {
      const item = localEquipmentItems.find((e) => String(e.id) === String(id));
      if (!item) throw new Error('Equipment item not found');
      return item;
    }
  },

  // EQ-03: Create equipment item
  createEquipment: async (payload: CreateEquipmentPayload): Promise<EquipmentItem> => {
    try {
      const response = await apiClient.post<EquipmentItem>('/equipment', payload);
      return response.data;
    } catch {
      const nextId =
        localEquipmentItems.length > 0
          ? Math.max(...localEquipmentItems.map((e) => Number(e.id))) + 1
          : 1;

      const newItem: EquipmentItem = {
        id: nextId,
        name: payload.name,
        category: payload.category,
        brand: payload.brand || null,
        description: payload.description || null,
        pricePaise: payload.pricePaise,
        stockQty: payload.stockQty,
        lowStockThreshold: payload.lowStockThreshold ?? 5,
        isActive: payload.isActive ?? true,
        imageUrl: payload.imageUrl || null,
        condition: payload.condition || 'Excellent',
        rentalRatePaise: payload.rentalRatePaise ?? 0,
        createdAt: new Date().toISOString(),
      };

      localEquipmentItems.unshift(newItem);
      return newItem;
    }
  },

  // EQ-04: Update equipment item
  updateEquipment: async (
    id: number | string,
    payload: UpdateEquipmentPayload
  ): Promise<EquipmentItem> => {
    try {
      const response = await apiClient.put<EquipmentItem>(`/equipment/${id}`, payload);
      return response.data;
    } catch {
      const index = localEquipmentItems.findIndex((e) => String(e.id) === String(id));
      if (index === -1) throw new Error('Equipment item not found');

      localEquipmentItems[index] = {
        ...localEquipmentItems[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return localEquipmentItems[index];
    }
  },

  // IV-01: Adjust stock level with reason
  adjustStock: async (
    id: number | string,
    payload: AdjustStockPayload
  ): Promise<EquipmentItem> => {
    try {
      const response = await apiClient.post<EquipmentItem>(
        `/equipment/${id}/adjust-stock`,
        payload
      );
      return response.data;
    } catch {
      const index = localEquipmentItems.findIndex((e) => String(e.id) === String(id));
      if (index === -1) throw new Error('Equipment item not found');

      const updatedQty = Math.max(0, localEquipmentItems[index].stockQty + payload.adjustmentQty);
      localEquipmentItems[index].stockQty = updatedQty;
      localEquipmentItems[index].updatedAt = new Date().toISOString();
      return localEquipmentItems[index];
    }
  },

  // Low stock alerts
  getLowStockAlerts: async (): Promise<EquipmentItem[]> => {
    try {
      const response = await apiClient.get<EquipmentItem[]>('/equipment/alerts/low-stock');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return localEquipmentItems.filter((e) => e.stockQty <= e.lowStockThreshold);
    } catch {
      return localEquipmentItems.filter((e) => e.stockQty <= e.lowStockThreshold);
    }
  },
};

function filterLocalEquipment(params?: { category?: string; search?: string }): EquipmentItem[] {
  let result = [...localEquipmentItems];
  if (!params) return result;

  if (params.category && params.category !== 'all') {
    result = result.filter(
      (e) => e.category.toLowerCase() === params.category!.toLowerCase()
    );
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.brand && e.brand.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
    );
  }

  return result;
}
