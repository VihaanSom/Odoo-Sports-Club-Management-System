import { apiClient } from './apiClient';
import { mockFacilities } from '@/mock';
import type { Facility } from '@/types';

export const facilityService = {
  getAll: async (): Promise<Facility[]> => {
    try {
      const response = await apiClient.get<Facility[]>('/facilities');
      return response.data;
    } catch {
      return mockFacilities;
    }
  },

  getById: async (id: string): Promise<Facility | undefined> => {
    try {
      const response = await apiClient.get<Facility>(`/facilities/${id}`);
      return response.data;
    } catch {
      return mockFacilities.find((f) => f.id === id);
    }
  },
};
