import { apiClient } from './apiClient';
import type {
  Court,
  CourtAvailability,
  CreateCourtPayload,
  UpdateCourtPayload,
} from '@/types/courts';

export const courtService = {
  /**
   * CO-01: List all courts with optional sport and isActive filters.
   */
  getCourts: async (params?: { sport?: string; isActive?: boolean }): Promise<Court[]> => {
    const response = await apiClient.get<{ success: boolean; data: Court[] }>('/courts', {
      params,
    });
    return response.data.data;
  },

  /**
   * Alias for getCourts matching the integration plan specification.
   */
  getAll: async (params?: { sport?: string; isActive?: boolean }): Promise<Court[]> => {
    const response = await apiClient.get<{ success: boolean; data: Court[] }>('/courts', {
      params,
    });
    return response.data.data;
  },

  /**
   * CO-02: Get slot availability matrix for courts on a specific date.
   */
  getAvailability: async (date: string, sport?: string): Promise<CourtAvailability[]> => {
    const response = await apiClient.get<{ success: boolean; data: CourtAvailability[] }>(
      '/courts/availability',
      {
        params: { date, sport: sport || undefined },
      }
    );
    return response.data.data;
  },

  /**
   * CO-03: Create a new court (Admin only).
   */
  createCourt: async (payload: CreateCourtPayload): Promise<Court> => {
    const response = await apiClient.post<{ success: boolean; data: Court }>(
      '/courts',
      payload
    );
    return response.data.data;
  },

  /**
   * CO-04: Update court details (Admin only).
   */
  updateCourt: async (id: number, payload: UpdateCourtPayload): Promise<Court> => {
    const response = await apiClient.put<{ success: boolean; data: Court }>(
      `/courts/${id}`,
      payload
    );
    return response.data.data;
  },
};

export default courtService;
