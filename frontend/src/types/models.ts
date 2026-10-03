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
  id: string;
  name: string;
  email: string;
  role: UserRole | 'admin' | 'manager' | 'member' | 'coach';
  avatarUrl?: string;
  memberId?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipPlan: MembershipTier | 'Standard' | 'Premium' | 'VIP' | 'Junior' | 'Gold' | 'Silver';
  status: MemberStatus | 'active' | 'suspended' | 'expired';
  joinedDate: string;
  avatarUrl?: string;
  odooPartnerId?: number;
}

export interface Facility {
  id: string;
  name: string;
  sport: SportType | 'Tennis' | 'Badminton' | 'Squash' | 'Basketball' | 'Swimming' | 'Gym' | 'Football';
  courtNumber: string;
  status: FacilityStatus | 'available' | 'booked' | 'maintenance';
  hourlyRate: number;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  memberId: string;
  memberName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus | 'confirmed' | 'pending' | 'in_progress' | 'upcoming' | 'cancelled';
  totalPrice: number;
}

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory | 'Rackets' | 'Balls' | 'Protective Gear' | 'Gym Accessories' | 'Court Accessories';
  quantityTotal: number;
  quantityAvailable: number;
  condition: EquipmentCondition | 'Excellent' | 'Good' | 'Fair' | 'Needs Service';
  rentalRate: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: MembershipTier | string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  popular: boolean;
  badge: string;
}

export interface ClubMetrics {
  totalMembers: number;
  activeBookingsToday: number;
  revenueThisMonth: number;
  equipmentUtilizationRate: number;
}
