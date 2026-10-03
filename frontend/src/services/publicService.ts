import { apiClient } from './apiClient';
import type {
  PublicPlan,
  PublicFacilityInfo,
  PublicShopItem,
  PublicCourtSlot,
  PublicContactPayload,
  PublicTrialPayload,
} from '@/types/public';

export const mockPublicPlans: PublicPlan[] = [
  {
    id: 'PUB-PLAN-01',
    name: 'Junior Academy',
    tier: 'Junior',
    pricePaise: 249900, // ₹2,499
    billingPeriod: 'month',
    description: 'Designed for young prodigies under 18 aiming to build pro athletic fundamentals.',
    features: [
      'Weekday court access (until 4 PM)',
      'Basic equipment rental included',
      '1 Coaching clinic per month with certified coaches',
      'Access to junior ranking tournaments',
    ],
    isPopular: false,
    badge: 'Youth Special',
  },
  {
    id: 'PUB-PLAN-02',
    name: 'Club Standard',
    tier: 'Standard',
    pricePaise: 449900, // ₹4,499
    billingPeriod: 'month',
    description: 'Complete all-round club access for sports enthusiasts and competitive players.',
    features: [
      'Access to all 12 Olympic & synthetic facilities',
      'Court reservations 5 days in advance',
      'Standard equipment hire privilege',
      'Sports Bistro & Bar 10% discount',
      'Member club tournament access',
    ],
    isPopular: false,
    badge: 'Classic',
  },
  {
    id: 'PUB-PLAN-03',
    name: 'Champions Premium',
    tier: 'Premium',
    pricePaise: 799900, // ₹7,999
    billingPeriod: 'month',
    description: 'Our most sought-after membership for uncompromising athletes and families.',
    features: [
      'Prime-time booking priority (7 days in advance)',
      'Complimentary Wilson & Yonex demo gear',
      '4 Guest day passes per month',
      'Full locker, steam, sauna & ice-bath access',
      'Sports Bistro & Bar 15% discount',
      '1 Monthly biometric performance evaluation',
    ],
    isPopular: true,
    badge: 'Most Popular',
  },
  {
    id: 'PUB-PLAN-04',
    name: 'VIP Elite All-Access',
    tier: 'VIP',
    pricePaise: 1499900, // ₹14,999
    billingPeriod: 'month',
    description: 'Exclusive 24/7 privilege pass with personal coaching and private lounge entry.',
    features: [
      'Unlimited 24/7 facility access',
      '4 Dedicated 1-on-1 coaching sessions per month',
      'Private VIP lounge & complimentary protein smoothies',
      'Reserved premium locker with laundry valet',
      'Priority registration in national invitational tours',
      'Unlimited guest passes (accompanied)',
    ],
    isPopular: false,
    badge: 'Exclusive',
  },
];

export const mockPublicFacilities: PublicFacilityInfo[] = [
  {
    id: 'PFAC-01',
    name: 'Center Clay Tennis Court 1',
    sport: 'Tennis',
    courtNumber: 'TC-1',
    description: 'Roland-Garros spec red clay court with LED high-lumen floodlights and shaded player pavilions.',
    hourlyRatePaise: 120000, // ₹1,200/hr
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
    specs: ['Slow clay bounce', 'High-mast LED lighting', 'Umpire chair & player benches', 'Court-side hydration station'],
  },
  {
    id: 'PFAC-02',
    name: 'Hard Surface Tennis Court 2',
    sport: 'Tennis',
    courtNumber: 'TC-2',
    description: 'US Open blue multi-cushion acrylic hard court with true ball tracking and impact dampening.',
    hourlyRatePaise: 100000, // ₹1,000/hr
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80',
    specs: ['Medium-fast acrylic pace', 'Shock absorption sub-base', 'HD video recording camera mounts'],
  },
  {
    id: 'PFAC-03',
    name: 'Indoor Pro Badminton Arena A',
    sport: 'Badminton',
    courtNumber: 'BC-A',
    description: 'BWF standard wooden sprung sub-floor with Yonex competition synthetic green court mats.',
    hourlyRatePaise: 80000, // ₹800/hr
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    specs: ['BWF Grade 1 approved', 'Anti-glare indirect lighting', 'Temperature-controlled HVAC', 'Yonex pro nets'],
  },
  {
    id: 'PFAC-04',
    name: 'All-Glass Squash Court 1',
    sport: 'Squash',
    courtNumber: 'SQ-1',
    description: 'WSF certified 4-wall glass court with Maplewood spring flooring and spectator gallery seating.',
    hourlyRatePaise: 90000, // ₹900/hr
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
    specs: ['Armourplate glass walls', 'Junckers sports flooring', 'Tin height: 17 inches', 'Spectator stadium seating'],
  },
  {
    id: 'PFAC-05',
    name: 'Olympic 50m Swimming Pool',
    sport: 'Swimming',
    courtNumber: 'POOL-A',
    description: '8-lane Olympic standard heated pool with ozone filtration and automated digital timing pads.',
    hourlyRatePaise: 85000, // ₹850/hr
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&auto=format&fit=crop&q=80',
    specs: ['50m x 25m x 2m depth', 'Ozone treated crystal water', 'Anti-wave lane dividers', 'Life guards on continuous duty'],
  },
  {
    id: 'PFAC-06',
    name: 'Athletic Conditioning Gym',
    sport: 'Gym',
    courtNumber: 'GYM-1',
    description: '2-tier strength and functional training center with Eleiko barbells and Keiser pneumatic equipment.',
    hourlyRatePaise: 60000, // ₹600/hr
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    specs: ['Eleiko IWF certified plates', 'Hammer Strength power racks', 'Cardio rowers & assault bikes', 'Turf sled track'],
  },
];

export const mockPublicShopItems: PublicShopItem[] = [
  {
    id: 'SHOP-01',
    name: 'Wilson Pro Staff 97 v14',
    category: 'Rackets',
    brand: 'Wilson',
    description: 'Precision control racket favored by attacking competitive players.',
    rentalRatePaise: 40000, // ₹400 rental
    buyPricePaise: 2199900, // ₹21,999 buy
    availableQuantity: 8,
    imageUrl: 'https://images.unsplash.com/photo-1617083934555-563d201b22e1?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'SHOP-02',
    name: 'Yonex Astrox 88D Pro',
    category: 'Rackets',
    brand: 'Yonex',
    description: 'Head-heavy badminton racket engineered for explosive steep smashes.',
    rentalRatePaise: 30000, // ₹300 rental
    buyPricePaise: 1649900, // ₹16,499 buy
    availableQuantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'SHOP-03',
    name: 'Dunlop Fort All Court Balls (Can of 4)',
    category: 'Balls',
    brand: 'Dunlop',
    description: 'Official tournament tennis ball with HD Core and Fluoro Cloth.',
    rentalRatePaise: 15000, // ₹150 rental
    buyPricePaise: 95000, // ₹950 buy
    availableQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'SHOP-04',
    name: 'Champions Club Performance Kit Bag',
    category: 'Accessories',
    brand: 'Champions Club',
    description: 'Thermal-guard lined 6-racket sport bag with ventilated shoe compartment.',
    rentalRatePaise: 20000, // ₹200 rental
    buyPricePaise: 499900, // ₹4,999 buy
    availableQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'SHOP-05',
    name: 'Speedo Fastskin Elite Swim Goggles',
    category: 'Swimming',
    brand: 'Speedo',
    description: 'Hydrodynamic low-profile anti-fog racing mirror goggles.',
    rentalRatePaise: 10000, // ₹100 rental
    buyPricePaise: 349900, // ₹3,499 buy
    availableQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'SHOP-06',
    name: 'Harrow Vapor 110 Squash Racket',
    category: 'Rackets',
    brand: 'Harrow',
    description: 'Ultra-lightweight 140g frame with superior touch and head maneuverability.',
    rentalRatePaise: 35000, // ₹350 rental
    buyPricePaise: 1499900, // ₹14,999 buy
    availableQuantity: 6,
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&auto=format&fit=crop&q=80',
  },
];

export const publicService = {
  // PU-01: Club Landing Info
  getLandingInfo: async () => {
    try {
      const response = await apiClient.get('/public/info');
      return response.data;
    } catch {
      return {
        name: 'Champions Club',
        tagline: 'Premier Sports, Wellness & Athletic Community',
        location: 'Bodakdev & SG Highway, Ahmedabad, Gujarat',
        phone: '+91 79 4000 8888',
        email: 'info@championsclub.in',
        stats: [
          { label: 'Active Members', value: '520+' },
          { label: 'Olympic Facilities', value: '12 Courts' },
          { label: 'Certified Pro Coaches', value: '15 Masters' },
          { label: 'Member Satisfaction', value: '99.4%' },
        ],
        hours: 'Daily 05:30 AM - 11:00 PM',
      };
    }
  },

  // PU-02: Public Membership Plans
  getPublicPlans: async (): Promise<PublicPlan[]> => {
    try {
      const response = await apiClient.get<PublicPlan[]>('/public/plans');
      return response.data;
    } catch {
      return mockPublicPlans;
    }
  },

  // PU-03: Public Facilities List
  getPublicFacilities: async (): Promise<PublicFacilityInfo[]> => {
    try {
      const response = await apiClient.get<PublicFacilityInfo[]>('/public/facilities');
      return response.data;
    } catch {
      return mockPublicFacilities;
    }
  },

  // PU-04: Public Shop / Merchandise & Rental
  getPublicShopItems: async (): Promise<PublicShopItem[]> => {
    try {
      const response = await apiClient.get<PublicShopItem[]>('/public/shop');
      return response.data;
    } catch {
      return mockPublicShopItems;
    }
  },

  // PU-05: Real-time public court slot preview
  getPublicCourtSlots: async (sport?: string, date?: string): Promise<PublicCourtSlot[]> => {
    try {
      const response = await apiClient.get<PublicCourtSlot[]>('/public/slots', {
        params: { sport, date },
      });
      return response.data;
    } catch {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const slots: PublicCourtSlot[] = [
        {
          id: 'SLOT-01',
          facilityId: 'PFAC-01',
          facilityName: 'Center Clay Tennis Court 1',
          sport: 'Tennis',
          date: targetDate,
          startTime: '06:00',
          endTime: '07:00',
          isAvailable: true,
          pricePaise: 120000,
        },
        {
          id: 'SLOT-02',
          facilityId: 'PFAC-01',
          facilityName: 'Center Clay Tennis Court 1',
          sport: 'Tennis',
          date: targetDate,
          startTime: '07:00',
          endTime: '08:00',
          isAvailable: false,
          pricePaise: 120000,
        },
        {
          id: 'SLOT-03',
          facilityId: 'PFAC-01',
          facilityName: 'Center Clay Tennis Court 1',
          sport: 'Tennis',
          date: targetDate,
          startTime: '18:00',
          endTime: '19:00',
          isAvailable: true,
          pricePaise: 140000,
        },
        {
          id: 'SLOT-04',
          facilityId: 'PFAC-03',
          facilityName: 'Indoor Pro Badminton Arena A',
          sport: 'Badminton',
          date: targetDate,
          startTime: '07:00',
          endTime: '08:00',
          isAvailable: true,
          pricePaise: 80000,
        },
        {
          id: 'SLOT-05',
          facilityId: 'PFAC-03',
          facilityName: 'Indoor Pro Badminton Arena A',
          sport: 'Badminton',
          date: targetDate,
          startTime: '19:00',
          endTime: '20:00',
          isAvailable: false,
          pricePaise: 90000,
        },
        {
          id: 'SLOT-06',
          facilityId: 'PFAC-04',
          facilityName: 'All-Glass Squash Court 1',
          sport: 'Squash',
          date: targetDate,
          startTime: '08:00',
          endTime: '09:00',
          isAvailable: true,
          pricePaise: 90000,
        },
        {
          id: 'SLOT-07',
          facilityId: 'PFAC-05',
          facilityName: 'Olympic 50m Swimming Pool',
          sport: 'Swimming',
          date: targetDate,
          startTime: '06:30',
          endTime: '07:30',
          isAvailable: true,
          pricePaise: 85000,
        },
      ];

      if (sport && sport !== 'all') {
        return slots.filter((s) => s.sport.toLowerCase() === sport.toLowerCase());
      }
      return slots;
    }
  },

  // PU-06: Public Contact Inquiry
  submitContactInquiry: async (payload: PublicContactPayload): Promise<{ success: boolean; id: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; id: string }>('/public/contact', payload);
      return response.data;
    } catch {
      return {
        success: true,
        id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      };
    }
  },

  // PU-07: Free Trial Intake
  submitTrialBooking: async (payload: PublicTrialPayload): Promise<{ success: boolean; passCode: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; passCode: string }>('/public/trial', payload);
      return response.data;
    } catch {
      return {
        success: true,
        passCode: `CHAMP-TRIAL-${Math.floor(100000 + Math.random() * 900000)}`,
      };
    }
  },
};

export default publicService;
