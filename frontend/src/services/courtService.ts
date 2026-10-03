import { apiClient } from './apiClient';
import { mockCourts, generateMockAvailability } from '@/mock/courts';
import type {
  Court,
  CourtAvailability,
  CreateCourtPayload,
  UpdateCourtPayload,
} from '@/types/courts';

export const courtService = {
  // CO-01: List courts
  getCourts: async (params?: { sport?: string; isActive?: boolean }): Promise<Court[]> => {
    try {
      const response = await apiClient.get<{ success?: boolean; data?: Court[] } | Court[]>('/courts', {
        params,
      });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && 'data' in data && Array.isArray(data.data)) return data.data;
      return mockCourts;
    } catch {
      let filtered = [...mockCourts];
      if (params?.sport) {
        filtered = filtered.filter((c) => c.sport === params.sport);
      }
      if (params?.isActive !== undefined) {
        filtered = filtered.filter((c) => c.isActive === params.isActive);
      }
      return filtered;
    }
  },

  // CO-02: Get slot availability matrix
  getAvailability: async (date: string, sport?: string): Promise<CourtAvailability[]> => {
    try {
      const response = await apiClient.get<
        { success?: boolean; data?: CourtAvailability[] } | CourtAvailability[]
      >('/courts/availability', {
        params: { date, sport },
      });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && 'data' in data && Array.isArray(data.data)) return data.data;
      return generateMockAvailability(date, sport);
    } catch {
      return generateMockAvailability(date, sport);
    }
  },

  // CO-03: Create court (Admin)
  createCourt: async (payload: CreateCourtPayload): Promise<Court> => {
    try {
      const response = await apiClient.post<{ success?: boolean; data?: Court } | Court>(
        '/courts',
        payload
      );
      const data = response.data;
      if (data && 'data' in data && data.data) return data.data;
      return data as Court;
    } catch {
      const newCourt: Court = {
        id: mockCourts.length + 1,
        name: payload.name,
        sport: payload.sport,
        openTime: payload.openTime || '06:00',
        closeTime: payload.closeTime || '22:00',
        isActive: true,
      };
      mockCourts.push(newCourt);
      return newCourt;
    }
  },

  // CO-04: Update court (Admin)
  updateCourt: async (id: number, payload: UpdateCourtPayload): Promise<Court> => {
    try {
      const response = await apiClient.put<{ success?: boolean; data?: Court } | Court>(
        `/courts/${id}`,
        payload
      );
      const data = response.data;
      if (data && 'data' in data && data.data) return data.data;
      return data as Court;
    } catch {
      const idx = mockCourts.findIndex((c) => c.id === id);
      if (idx !== -1) {
        mockCourts[idx] = { ...mockCourts[idx], ...payload };
        return mockCourts[idx];
      }
      throw new Error(`Court ${id} not found`);
    }
  },
};
