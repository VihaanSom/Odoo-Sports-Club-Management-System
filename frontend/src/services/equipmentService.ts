import { apiClient } from './apiClient';
import { mockEquipment } from '@/mock';
import type { Equipment } from '@/types';

export const equipmentService = {
  getAll: async (): Promise<Equipment[]> => {
    try {
      const response = await apiClient.get<Equipment[]>('/equipment');
      return response.data;
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
};
