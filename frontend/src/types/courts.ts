export type SportCategory = 'tennis' | 'cricket';

export interface Court {
  id: number;
  name: string;
  sport: SportCategory;
  openTime: string; // "HH:mm" (e.g. "06:00")
  closeTime: string; // "HH:mm" (e.g. "23:00")
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlotAvailabilityItem {
  slotStart: string; // ISO datetime
  slotEnd: string; // ISO datetime
  status: 'free' | 'booked';
  bookingType?: 'member' | 'walk_in' | 'social';
  bookingId?: number;
}

export interface CourtAvailability {
  courtId: number;
  courtName: string;
  sport: SportCategory;
  slots: SlotAvailabilityItem[];
}

export interface CreateCourtPayload {
  name: string;
  sport: SportCategory;
  openTime?: string;
  closeTime?: string;
}

export interface UpdateCourtPayload {
  name?: string;
  openTime?: string;
  closeTime?: string;
  isActive?: boolean;
}
