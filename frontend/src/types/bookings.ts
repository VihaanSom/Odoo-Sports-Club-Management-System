export type BookingType = 'member' | 'walk_in' | 'social';
export type BookingRecordStatus = 'confirmed' | 'cancelled';
export type BookingPaymentMethod = 'cash' | 'card' | 'upi' | 'plan';

export interface BookingParticipant {
  memberId?: number;
  memberName?: string;
  guestName?: string;
}

export interface BookingDetail {
  id: number;
  courtId: number;
  courtName: string;
  sport?: 'tennis' | 'cricket';
  memberId: number | null;
  memberName: string | null;
  guestName: string | null;
  guestPhone: string | null;
  bookingType: BookingType;
  slotStart: string; // ISO UTC string
  slotEnd: string; // ISO UTC string
  status: BookingRecordStatus;
  amountPaidPaise: number; // in paise (e.g. 50000 = ₹500)
  paymentMethod: BookingPaymentMethod;
  notes: string | null;
  participants?: BookingParticipant[];
  createdAt: string;
}

export interface CreateMemberBookingPayload {
  courtId: number;
  memberId: number;
  slotStart: string; // ISO datetime, 30-min boundary
  slotEnd: string; // ISO datetime
  bookingType: 'member';
  paymentMethod: BookingPaymentMethod;
  notes?: string;
}

export interface CreateWalkInBookingPayload {
  courtId: number;
  guestName: string;
  guestPhone?: string;
  slotStart: string;
  slotEnd: string;
  bookingType: 'walk_in';
  paymentMethod: 'cash' | 'card' | 'upi';
  notes?: string;
}

export interface CreateSocialBookingPayload {
  courtId: number;
  slotStart: string;
  slotEnd: string;
  paymentMethod: 'cash' | 'card' | 'upi';
  participants: (
    | { memberId: number; memberName?: string }
    | { guestName: string }
  )[];
  notes?: string;
}

export interface CancelBookingPayload {
  reason?: string;
}

export interface TodaysBookingItem {
  id: number;
  slotStart: string;
  slotEnd: string;
  bookingType: BookingType;
  status: BookingRecordStatus;
  memberName: string | null;
}

export interface TodaysCourtSchedule {
  courtId: number;
  courtName: string;
  sport: string;
  bookings: TodaysBookingItem[];
}

export interface TodaysBookingsResponse {
  date: string;
  courts: TodaysCourtSchedule[];
}

export interface BookingQueryParams {
  page?: number;
  pageSize?: number;
  date?: string;
  courtId?: number;
  memberId?: number;
  status?: 'confirmed' | 'cancelled';
  bookingType?: BookingType;
  sortBy?: 'slot_start' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}
