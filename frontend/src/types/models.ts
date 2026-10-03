import type {
  SportType,
  MembershipTier,
  MemberStatus,
  FacilityStatus,
  BookingStatus,
  EquipmentCondition,
  EquipmentCategory,
  UserRole,
} from './enums';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  /** Computed display name: `${firstName} ${lastName}` */
  name?: string;
  role: UserRole | 'admin' | 'front_desk' | 'bar' | 'shop' | 'member';
  tier?: string | null;
  planId?: number;
  status?: string;
  phone?: string;
  avatarUrl?: string;
  photoUrl?: string;
  memberId?: number;
  membershipStart?: string;
  membershipEnd?: string;
}

export interface Member {
  id: number;
  firstName?: string;
  lastName?: string;
  /** Computed display name */
  name?: string;
  email: string;
  phone: string;
  tier: MembershipTier | 'Standard' | 'Premium' | 'VIP' | 'Junior' | 'Gold' | 'Silver';
  /** @deprecated Use `tier` — kept for backward compat during migration */
  membershipPlan?: MembershipTier | 'Standard' | 'Premium' | 'VIP' | 'Junior' | 'Gold' | 'Silver';
  status: MemberStatus | 'active' | 'suspended' | 'expired';
  membershipStart?: string;
  membershipEnd?: string;
  /** @deprecated Use `membershipStart` */
  joinedDate?: string;
  avatarUrl?: string;
  photoUrl?: string;
  odooPartnerId?: number;
}

export interface Facility {
  id: number;
  name: string;
  sport: SportType | 'Tennis' | 'Badminton' | 'Squash' | 'Basketball' | 'Swimming' | 'Gym' | 'Football';
  courtNumber: string;
  status: FacilityStatus | 'available' | 'booked' | 'maintenance';
  hourlyRate: number;
  imageUrl?: string;
}

export interface Booking {
  id: number;
  courtId?: number;
  facilityId?: number;
  courtName?: string;
  facilityName?: string;
  memberId?: number;
  memberName?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  slotStart?: string;
  slotEnd?: string;
  status: BookingStatus | 'confirmed' | 'pending' | 'in_progress' | 'upcoming' | 'cancelled';
  /** Amount in paise */
  amountPaidPaise?: number;
  /** @deprecated Use amountPaidPaise */
  totalPrice?: number;
}

export interface Equipment {
  id: number;
  name: string;
  category: EquipmentCategory | 'Rackets' | 'Balls' | 'Protective Gear' | 'Gym Accessories' | 'Court Accessories';
  quantityTotal?: number;
  quantityAvailable?: number;
  stockQty?: number;
  condition?: EquipmentCondition | 'Excellent' | 'Good' | 'Fair' | 'Needs Service';
  /** Price in paise */
  pricePaise?: number;
  /** @deprecated Use pricePaise */
  rentalRate?: number;
}

export interface MembershipPlan {
  id: number;
  name?: string;
  tier: MembershipTier | string;
  durationMonths: number;
  pricePaise: number;
  courtRatePaise?: number;
  shopDiscountPct?: number;
  barDiscountPct?: number;
  /** @deprecated Use pricePaise */
  price?: string;
  /** @deprecated Use durationMonths */
  period?: string;
  description?: string;
  desc?: string;
  features?: string[];
  isActive?: boolean;
  popular?: boolean;
  badge?: string;
}

export interface ClubMetrics {
  totalMembers: number;
  activeBookingsToday: number;
  revenueThisMonth: number;
  equipmentUtilizationRate: number;
}
