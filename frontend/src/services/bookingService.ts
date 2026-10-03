import { apiClient } from './apiClient';
import { mockBookings } from '@/mock';
import type { Booking } from '@/types';

export const bookingService = {
  getAll: async (): Promise<Booking[]> => {
    try {
      const response = await apiClient.get<Booking[]>('/bookings');
      return response.data;
    } catch {
      return mockBookings;
    }
  },

  create: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    try {
      const response = await apiClient.post<Booking>('/bookings', booking);
      return response.data;
    } catch {
      const newBooking: Booking = {
        ...booking,
        id: `BK-100${mockBookings.length + 1}`,
      };
      return newBooking;
    }
  },
};
