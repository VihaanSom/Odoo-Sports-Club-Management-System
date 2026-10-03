import { apiClient } from './apiClient';
import {
  mockBookings,
  mockDetailedBookings,
  mockTodaysBookings,
} from '@/mock/bookings';
import type { Booking } from '@/types/models';
import type {
  BookingDetail,
  BookingQueryParams,
  CreateMemberBookingPayload,
  CreateWalkInBookingPayload,
  CreateSocialBookingPayload,
  CancelBookingPayload,
  TodaysBookingsResponse,
} from '@/types/bookings';

export const bookingService = {
  // Legacy support for initial scaffold
  getAll: async (): Promise<Booking[]> => {
    try {
      const response = await apiClient.get<Booking[]>('/bookings');
      return response.data;
    } catch {
      return mockBookings;
    }
  },

  // Legacy support
  create: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    try {
      const response = await apiClient.post<Booking>('/bookings', booking);
      return response.data;
    } catch {
      const newBooking: Booking = {
        ...booking,
        id: `BK-100${mockBookings.length + 1}`,
      };
      mockBookings.unshift(newBooking);
      return newBooking;
    }
  },

  // BK-01: List bookings with filters & pagination
  getBookings: async (
    params?: BookingQueryParams
  ): Promise<{ data: BookingDetail[]; total: number }> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: BookingDetail[];
        pagination?: { total: number };
      }>('/bookings', { params });

      if (Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length };
      }
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data &&
        Array.isArray(response.data.data)
      ) {
        return {
          data: response.data.data,
          total: response.data.pagination?.total ?? response.data.data.length,
        };
      }
      throw new Error('Unrecognized response structure');
    } catch {
      let filtered = [...mockDetailedBookings];
      if (params?.courtId) {
        filtered = filtered.filter((b) => b.courtId === params.courtId);
      }
      if (params?.memberId) {
        filtered = filtered.filter((b) => b.memberId === params.memberId);
      }
      if (params?.status) {
        filtered = filtered.filter((b) => b.status === params.status);
      }
      if (params?.bookingType) {
        filtered = filtered.filter((b) => b.bookingType === params.bookingType);
      }
      if (params?.date) {
        filtered = filtered.filter((b) => b.slotStart.startsWith(params.date!));
      }
      return { data: filtered, total: filtered.length };
    }
  },

  // BK-02: Create member booking
  createMemberBooking: async (payload: CreateMemberBookingPayload): Promise<BookingDetail> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: BookingDetail } | BookingDetail>(
        '/bookings',
        payload
      );
      const data = response.data;
      if (data && 'data' in data && data.data) return data.data;
      return data as BookingDetail;
    } catch {
      const newRecord: BookingDetail = {
        id: 200 + mockDetailedBookings.length,
        courtId: payload.courtId,
        courtName: `Court ${payload.courtId}`,
        sport: 'tennis',
        memberId: payload.memberId,
        memberName: `Member #${payload.memberId}`,
        guestName: null,
        guestPhone: null,
        bookingType: 'member',
        slotStart: payload.slotStart,
        slotEnd: payload.slotEnd,
        status: 'confirmed',
        amountPaidPaise: 40000,
        paymentMethod: payload.paymentMethod,
        notes: payload.notes || null,
        createdAt: new Date().toISOString(),
      };
      mockDetailedBookings.unshift(newRecord);
      return newRecord;
    }
  },

  // BK-02: Create walk-in booking
  createWalkInBooking: async (payload: CreateWalkInBookingPayload): Promise<BookingDetail> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: BookingDetail } | BookingDetail>(
        '/bookings',
        payload
      );
      const data = response.data;
      if (data && 'data' in data && data.data) return data.data;
      return data as BookingDetail;
    } catch {
      const newRecord: BookingDetail = {
        id: 200 + mockDetailedBookings.length,
        courtId: payload.courtId,
        courtName: `Court ${payload.courtId}`,
        sport: 'tennis',
        memberId: null,
        memberName: null,
        guestName: payload.guestName,
        guestPhone: payload.guestPhone || null,
        bookingType: 'walk_in',
        slotStart: payload.slotStart,
        slotEnd: payload.slotEnd,
        status: 'confirmed',
        amountPaidPaise: 50000,
        paymentMethod: payload.paymentMethod,
        notes: payload.notes || null,
        createdAt: new Date().toISOString(),
      };
      mockDetailedBookings.unshift(newRecord);
      return newRecord;
    }
  },

  // BK-05: Create social booking
  createSocialBooking: async (payload: CreateSocialBookingPayload): Promise<BookingDetail> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: BookingDetail } | BookingDetail>(
        '/bookings/social',
        payload
      );
      const data = response.data;
      if (data && 'data' in data && data.data) return data.data;
      return data as BookingDetail;
    } catch {
      const newRecord: BookingDetail = {
        id: 200 + mockDetailedBookings.length,
        courtId: payload.courtId,
        courtName: `Court ${payload.courtId}`,
        sport: 'tennis',
        memberId: null,
        memberName: null,
        guestName: 'Social Play Group',
        guestPhone: null,
        bookingType: 'social',
        slotStart: payload.slotStart,
        slotEnd: payload.slotEnd,
        status: 'confirmed',
        amountPaidPaise: 60000,
        paymentMethod: payload.paymentMethod,
        notes: payload.notes || null,
        participants: payload.participants,
        createdAt: new Date().toISOString(),
      };
      mockDetailedBookings.unshift(newRecord);
      return newRecord;
    }
  },

  // BK-03: Get booking detail by ID
  getBookingById: async (id: number): Promise<BookingDetail | undefined> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: BookingDetail } | BookingDetail>(
        `/bookings/${id}`
      );
      const data = response.data;
      if (data && typeof data === 'object' && 'data' in data && data.data) return data.data;
      if (data && typeof data === 'object' && 'courtId' in data) return data as BookingDetail;
      throw new Error('Invalid booking detail format');
    } catch {
      return mockDetailedBookings.find((b) => b.id === id);
    }
  },

  // BK-04: Cancel booking
  cancelBooking: async (id: number, payload?: CancelBookingPayload): Promise<BookingDetail> => {
    try {
      const response = await apiClient.put<{ success: boolean; data: BookingDetail } | BookingDetail>(
        `/bookings/${id}/cancel`,
        payload
      );
      const data = response.data;
      if (data && typeof data === 'object' && 'data' in data && data.data) return data.data;
      if (data && typeof data === 'object' && 'id' in data) return data as BookingDetail;
      throw new Error('Invalid cancel response format');
    } catch {
      const target = mockDetailedBookings.find((b) => b.id === id);
      if (target) {
        target.status = 'cancelled';
        if (payload?.reason) {
          target.notes = target.notes ? `${target.notes} | Cancel reason: ${payload.reason}` : `Cancel reason: ${payload.reason}`;
        }
        return target;
      }
      throw new Error(`Booking ${id} not found`);
    }
  },

  // BK-06: Today's bookings timeline
  getTodayBookings: async (): Promise<TodaysBookingsResponse> => {
    try {
      const response = await apiClient.get<
        { success: boolean; data: TodaysBookingsResponse } | TodaysBookingsResponse
      >('/bookings/today');
      const data = response.data;
      if (data && typeof data === 'object' && 'data' in data && data.data) return data.data;
      if (data && typeof data === 'object' && 'courts' in data) return data as TodaysBookingsResponse;
      throw new Error('Invalid today bookings format');
    } catch {
      return mockTodaysBookings;
    }
  },
};
