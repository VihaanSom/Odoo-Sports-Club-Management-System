import { apiClient } from './apiClient';
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
  /**
   * BK-01: List bookings with filters & pagination.
   */
  getBookings: async (
    params?: BookingQueryParams
  ): Promise<{
    data: BookingDetail[];
    total: number;
    pagination?: { page: number; pageSize: number; total: number; totalPages: number };
  }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: BookingDetail[];
      pagination?: { page: number; pageSize: number; total: number; totalPages: number };
    }>('/bookings', { params });

    const data = response.data.data || [];
    const pagination = response.data.pagination;
    const total = pagination?.total ?? data.length;

    return {
      data,
      total,
      pagination,
    };
  },

  /**
   * Alias for listing bookings (integration plan specification).
   */
  getAll: async (params?: BookingQueryParams): Promise<BookingDetail[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: BookingDetail[];
    }>('/bookings', { params });
    return response.data.data;
  },

  /**
   * Generic create booking dispatcher.
   */
  create: async (
    payload: CreateMemberBookingPayload | CreateWalkInBookingPayload
  ): Promise<BookingDetail> => {
    const response = await apiClient.post<{
      success: boolean;
      data: BookingDetail;
    }>('/bookings', payload);
    return response.data.data;
  },

  /**
   * BK-02: Create member booking.
   */
  createMemberBooking: async (
    payload: CreateMemberBookingPayload
  ): Promise<BookingDetail> => {
    const response = await apiClient.post<{
      success: boolean;
      data: BookingDetail;
    }>('/bookings', payload);
    return response.data.data;
  },

  /**
   * BK-02: Create walk-in booking.
   */
  createWalkInBooking: async (
    payload: CreateWalkInBookingPayload
  ): Promise<BookingDetail> => {
    const response = await apiClient.post<{
      success: boolean;
      data: BookingDetail;
    }>('/bookings', payload);
    return response.data.data;
  },

  /**
   * BK-05: Create social group booking.
   */
  createSocialBooking: async (
    payload: CreateSocialBookingPayload
  ): Promise<BookingDetail> => {
    const response = await apiClient.post<{
      success: boolean;
      data: BookingDetail;
    }>('/bookings/social', payload);
    return response.data.data;
  },

  /**
   * BK-03: Get booking detail by ID.
   */
  getBookingById: async (id: number): Promise<BookingDetail> => {
    const response = await apiClient.get<{
      success: boolean;
      data: BookingDetail;
    }>(`/bookings/${id}`);
    return response.data.data;
  },

  /**
   * BK-04: Cancel confirmed booking.
   */
  cancelBooking: async (
    id: number,
    payload?: CancelBookingPayload
  ): Promise<BookingDetail> => {
    const response = await apiClient.put<{
      success: boolean;
      data: BookingDetail;
    }>(`/bookings/${id}/cancel`, payload || {});
    return response.data.data;
  },

  /**
   * BK-06: Today's bookings timeline across all courts.
   */
  getTodayBookings: async (date?: string): Promise<TodaysBookingsResponse> => {
    const response = await apiClient.get<{
      success: boolean;
      data: TodaysBookingsResponse;
    }>('/bookings/today', {
      params: date ? { date } : undefined,
    });
    return response.data.data;
  },

  /**
   * Alias for getTodayBookings (integration plan specification).
   */
  getToday: async (date?: string): Promise<TodaysBookingsResponse> => {
    const response = await apiClient.get<{
      success: boolean;
      data: TodaysBookingsResponse;
    }>('/bookings/today', {
      params: date ? { date } : undefined,
    });
    return response.data.data;
  },
};

export default bookingService;
