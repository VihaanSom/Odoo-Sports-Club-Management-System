export interface PublicPlan {
  id: string;
  name: string;
  tier: string;
  pricePaise: number;
  billingPeriod: string;
  features: string[];
  isPopular: boolean;
  badge?: string;
  description: string;
  durationMonths?: number;
}

export interface PublicFacilityInfo {
  id: string;
  name: string;
  sport: string;
  courtNumber: string;
  description: string;
  hourlyRatePaise: number;
  status: 'available' | 'booked' | 'maintenance';
  imageUrl?: string;
  specs: string[];
}

export interface PublicShopItem {
  id: string;
  name: string;
  category: string;
  description: string;
  rentalRatePaise: number;
  buyPricePaise: number;
  availableQuantity: number;
  imageUrl?: string;
  brand?: string;
}

export interface PublicCourtSlot {
  id: string;
  facilityId: string;
  facilityName: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  pricePaise: number;
}

export interface PublicContactPayload {
  fullName: string;
  email: string;
  phone: string;
  sportInterest: string;
  state: string;
  preferredTime?: string;
  message: string;
}

export interface PublicTrialPayload {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  date?: string;
  name?: string;
  sport?: string;
  preferredSlot?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  state?: string;
}
