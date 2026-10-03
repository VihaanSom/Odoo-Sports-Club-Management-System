export enum SportType {
  TENNIS = 'Tennis',
  BADMINTON = 'Badminton',
  SQUASH = 'Squash',
  BASKETBALL = 'Basketball',
  SWIMMING = 'Swimming',
  GYM = 'Gym',
  FOOTBALL = 'Football',
}

export enum MembershipTier {
  GOLD = 'Gold',
  SILVER = 'Silver',
  JUNIOR = 'Junior',
  STANDARD = 'Standard',
  PREMIUM = 'Premium',
  VIP = 'VIP',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  PLAN = 'plan',
}

export enum MemberStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

export enum FacilityStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance',
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  UPCOMING = 'upcoming',
  CANCELLED = 'cancelled',
}

export enum EquipmentCondition {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  NEEDS_SERVICE = 'Needs Service',
}

export enum EquipmentCategory {
  RACKETS = 'Rackets',
  BALLS = 'Balls',
  PROTECTIVE_GEAR = 'Protective Gear',
  GYM_ACCESSORIES = 'Gym Accessories',
  COURT_ACCESSORIES = 'Court Accessories',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  COACH = 'coach',
  MEMBER = 'member',
}
