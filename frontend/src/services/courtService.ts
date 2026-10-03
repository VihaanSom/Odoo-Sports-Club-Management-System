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
   * If member role gets 403 (CO-01 is staff-only), gracefully falls back to /public/courts or /courts/availability.
   */
  getCourts: async (params?: { sport?: string; isActive?: boolean }): Promise<Court[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Court[] }>('/courts', {
        params,
      });
      return response.data.data;
    } catch (err: any) {
      if (err.response?.status === 403) {
        try {
          const pub = await apiClient.get<{ success: boolean; data: any[] }>('/public/courts');
          return pub.data.data.map((c: any) => ({
            ...c,
            sportType: c.sport,
            surfaceType: 'Standard',
            hourlyRatePaise: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) as Court[];
        } catch {
          const today = new Date().toISOString().split('T')[0];
          const avail = await courtService.getAvailability(today, params?.sport);
          return avail.map((a) => ({
            id: a.courtId,
            name: a.courtName,
            sport: a.sportType || 'Tennis',
            sportType: a.sportType || 'Tennis',
            surfaceType: 'Standard',
            hourlyRatePaise: 0,
            openTime: '06:00',
            closeTime: '22:00',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) as unknown as Court[];
        }
      }
      throw err;
    }
  },

  /**
   * Alias for getCourts matching the integration plan specification.
   */
  getAll: async (params?: { sport?: string; isActive?: boolean }): Promise<Court[]> => {
    return courtService.getCourts(params);
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
