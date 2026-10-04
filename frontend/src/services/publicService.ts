import { apiClient } from './apiClient';
import type {
  PublicPlan,
  PublicFacilityInfo,
  PublicShopItem,
  PublicCourtSlot,
  PublicContactPayload,
  PublicTrialPayload,
} from '@/types/public';

export interface BackendTierPlan {
  id: number;
  durationMonths: number;
  pricePaise: number;
  courtRatePaise: number;
  shopDiscountPct: number;
  barDiscountPct: number;
}

export interface BackendTierGroup {
  tier: string;
  plans: BackendTierPlan[];
}

export interface BackendPublicCourt {
  id: number;
  name: string;
  sport: string;
  openTime: string;
  closeTime: string;
}

export interface BackendPublicEquipment {
  id: number;
  name: string;
  category: string;
  brand: string | null;
  description: string | null;
  pricePaise: number;
  imageUrl: string | null;
}

export interface BackendPublicSlot {
  slotStart: string;
  slotEnd: string;
  status: 'free' | 'booked';
  bookingType?: string;
}

export interface BackendPublicCourtAvailability {
  courtId: number;
  courtName: string;
  sport: string;
  slots: BackendPublicSlot[];
}

export interface PublicRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  tier: 'Gold' | 'Silver' | 'Junior';
  planId: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  referenceNo?: string;
  address?: {
    addrLine1: string;
    addrLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export const publicService = {
  // PU-01: Club Landing Information
  getLandingInfo: async () => {
    return {
      name: 'Champions Club',
      tagline: 'Premier Sports, Wellness & Athletic Community',
      location: 'Bodakdev & SG Highway, Ahmedabad, Gujarat',
      phone: '+91 79 4000 8888',
      email: 'info@championsclub.in',
      stats: [
        { label: 'Active Members', value: '350+' },
        { label: 'Olympic Facilities', value: '6 Courts' },
        { label: 'Certified Pro Coaches', value: '15 Masters' },
        { label: 'Member Satisfaction', value: '99.4%' },
      ],
      hours: 'Daily 06:00 AM - 11:00 PM',
    };
  },

  // PU-01: Public Membership Plans (GET /public/plans)
  getPlans: async (): Promise<PublicPlan[]> => {
    const response = await apiClient.get<{ success: boolean; data: BackendTierGroup[] }>('/public/plans');
    const raw: BackendTierGroup[] = (response.data as any).data || response.data || [];

    const plans: PublicPlan[] = [];

    raw.forEach((tierGroup) => {
      (tierGroup.plans || []).forEach((plan) => {
        const isGold = tierGroup.tier === 'Gold';
        const isSilver = tierGroup.tier === 'Silver';

        plans.push({
          id: String(plan.id),
          name: `${tierGroup.tier} ${plan.durationMonths === 12 ? 'Annual' : `${plan.durationMonths}-Month`} Membership`,
          tier: tierGroup.tier,
          pricePaise: plan.pricePaise,
          billingPeriod: plan.durationMonths === 12 ? 'year' : `${plan.durationMonths}m`,
          durationMonths: plan.durationMonths,
          features: [
            plan.courtRatePaise === 0
              ? 'Complimentary court bookings'
              : `Court Booking: ₹${(plan.courtRatePaise / 100).toFixed(0)}/hr`,
            `Pro Shop Gear Discount: ${plan.shopDiscountPct}%`,
            `Sports Bistro & Bar Discount: ${plan.barDiscountPct}%`,
            `Full ${plan.durationMonths}-month athletic facility access`,
          ],
          isPopular: isGold,
          badge: isGold ? 'Most Popular' : isSilver ? 'Classic' : 'Junior Special',
          description: `All-inclusive ${tierGroup.tier} membership with international standard court access and club privileges.`,
        });
      });
    });

    return plans;
  },

  // Alias for backward compatibility
  getPublicPlans: async (): Promise<PublicPlan[]> => {
    return publicService.getPlans();
  },

  // PU-02: Public Courts List (GET /public/courts)
  getCourts: async (): Promise<PublicFacilityInfo[]> => {
    const response = await apiClient.get<{ success: boolean; data: BackendPublicCourt[] }>('/public/courts');
    const raw: BackendPublicCourt[] = (response.data as any).data || response.data || [];

    return raw.map((c) => {
      const isTennis = c.sport.toLowerCase() === 'tennis';
      return {
        id: String(c.id),
        name: c.name,
        sport: isTennis ? 'Tennis' : 'Cricket',
        courtNumber: `#${c.id}`,
        description: `${c.name} equipped with tournament lighting. Operating daily from ${c.openTime} to ${c.closeTime}.`,
        hourlyRatePaise: isTennis ? 25000 : 40000,
        status: 'available',
        imageUrl: isTennis
          ? 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800'
          : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
        specs: [
          `Hours: ${c.openTime} - ${c.closeTime}`,
          'LED Floodlit match play',
          'Competition grade surface',
          'Player seating pavilion',
        ],
      };
    });
  },

  // Alias for backward compatibility
  getPublicFacilities: async (): Promise<PublicFacilityInfo[]> => {
    return publicService.getCourts();
  },

  // PU-03: Public Shop Catalogue (GET /public/equipment)
  getEquipment: async (category?: string, search?: string): Promise<PublicShopItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: BackendPublicEquipment[] }>('/public/equipment', {
      params: { category, search },
    });
    const raw: BackendPublicEquipment[] = (response.data as any).data || response.data || [];

    return raw.map((item) => ({
      id: String(item.id),
      name: item.name,
      category: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Accessories',
      brand: item.brand || undefined,
      description: item.description || 'Competition-grade club sports equipment.',
      rentalRatePaise: Math.round(item.pricePaise * 0.1),
      buyPricePaise: item.pricePaise,
      availableQuantity: 10,
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500',
    }));
  },

  // Alias for backward compatibility
  getPublicShopItems: async (): Promise<PublicShopItem[]> => {
    return publicService.getEquipment();
  },

  // PU-04: Public Slot Availability (GET /public/slots?date=YYYY-MM-DD)
  getSlots: async (date?: string, sport?: string): Promise<PublicCourtSlot[]> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const backendSport = sport && sport !== 'all' ? sport.toLowerCase() : undefined;

    const response = await apiClient.get<{ success: boolean; data: BackendPublicCourtAvailability[] }>('/public/slots', {
      params: { date: targetDate, sport: backendSport },
    });
    const raw: BackendPublicCourtAvailability[] = (response.data as any).data || response.data || [];

    const flatSlots: PublicCourtSlot[] = [];

    raw.forEach((court) => {
      (court.slots || []).forEach((s) => {
        const startTime = s.slotStart.includes('T') ? s.slotStart.split('T')[1].slice(0, 5) : s.slotStart;
        const endTime = s.slotEnd.includes('T') ? s.slotEnd.split('T')[1].slice(0, 5) : s.slotEnd;
        const slotDate = s.slotStart.includes('T') ? s.slotStart.split('T')[0] : targetDate;

        flatSlots.push({
          id: `SLOT-${court.courtId}-${s.slotStart}`,
          facilityId: String(court.courtId),
          facilityName: court.courtName,
          sport: court.sport ? court.sport.charAt(0).toUpperCase() + court.sport.slice(1) : 'Tennis',
          date: slotDate,
          startTime,
          endTime,
          isAvailable: s.status === 'free',
          pricePaise: court.sport.toLowerCase() === 'tennis' ? 25000 : 40000,
        });
      });
    });

    return flatSlots;
  },

  // Alias for backward compatibility
  getPublicCourtSlots: async (sport?: string, date?: string): Promise<PublicCourtSlot[]> => {
    return publicService.getSlots(date, sport);
  },

  // PU-05: Submit Visitor Enquiry (POST /public/leads)
  submitEnquiry: async (payload: { name: string; email?: string; phone?: string; message?: string }): Promise<{ success: boolean; id: string; message?: string }> => {
    const response = await apiClient.post<{ success: boolean; data: { id: number; message: string } }>('/public/leads', payload);
    const data = (response.data as any).data || response.data;
    return {
      success: true,
      id: `INQ-${data.id}`,
      message: data.message,
    };
  },

  // PU-05: Contact Page adapter
  submitContactInquiry: async (payload: PublicContactPayload): Promise<{ success: boolean; id: string }> => {
    const messageParts: string[] = [];
    if (payload.sportInterest) messageParts.push(`[Sport: ${payload.sportInterest}]`);
    if (payload.preferredTime) messageParts.push(`[Preferred Time: ${payload.preferredTime}]`);
    if (payload.message) messageParts.push(payload.message);

    const body = {
      name: payload.fullName,
      email: payload.email || undefined,
      phone: payload.phone || undefined,
      message: messageParts.join(' ') || undefined,
    };

    return publicService.submitEnquiry(body);
  },

  // PU-06: Request Trial Session (POST /public/trial)
  requestTrial: async (payload: {
    name: string;
    email: string;
    phone?: string;
    sport: 'tennis' | 'cricket';
    preferredDate: string;
    preferredTime: string;
  }): Promise<{ success: boolean; passCode: string; bookingId?: number | null; courtName?: string; message?: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        leadId: number;
        bookingId: number | null;
        courtName?: string;
        slotStart?: string;
        slotEnd?: string;
        message: string;
      };
    }>('/public/trial', payload);

    const data = (response.data as any).data || response.data;
    return {
      success: true,
      passCode: data.bookingId ? `CHAMP-PASS-${data.bookingId}` : `CHAMP-LEAD-${data.leadId}`,
      bookingId: data.bookingId,
      courtName: data.courtName,
      message: data.message,
    };
  },

  // PU-06: Trial Page adapter
  submitTrialBooking: async (payload: PublicTrialPayload): Promise<{ success: boolean; passCode: string; message?: string }> => {
    const body = {
      name: payload.fullName || payload.name,
      fullName: payload.fullName || payload.name,
      email: payload.email,
      phone: payload.phone || undefined,
      date: payload.preferredDate || payload.date,
      preferredDate: payload.preferredDate || payload.date,
    };

    const response = await apiClient.post<{
      success: boolean;
      data: {
        leadId: number;
        bookingId: number | null;
        passCode?: string;
        message?: string;
      };
    }>('/public/trial', body);

    const data = (response.data as any).data || response.data;
    const passCode = data.passCode || (data.bookingId ? `CHAMP-PASS-${data.bookingId}` : `CHAMP-PASS-${data.leadId}`);
    return {
      success: true,
      passCode,
      message: data.message,
    };
  },

  // PU-07: Member Self-Registration (POST /public/register)
  register: async (payload: PublicRegisterPayload) => {
    const response = await apiClient.post('/public/register', payload);
    return (response.data as any).data || response.data;
  },
};

export default publicService;
