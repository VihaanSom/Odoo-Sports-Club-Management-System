import { z } from 'zod';

export type TierType = 'Gold' | 'Silver' | 'Junior';
export type PaymentMethodType = 'cash' | 'card' | 'upi';

export interface TierInfo {
  id: TierType;
  name: string;
  badge: string;
  badgeColor: string;
  pricePerMonth: number;
  pricePerYear: number;
  description: string;
  perks: string[];
  recommended?: boolean;
}

export const MEMBERSHIP_TIERS: TierInfo[] = [
  {
    id: 'Gold',
    name: 'Gold Member',
    badge: 'Premium Access',
    badgeColor: 'badge-warning',
    pricePerMonth: 4999,
    pricePerYear: 49999,
    description: 'Full, unrestricted access to all courts, gym, bar, and exclusive club lounge.',
    perks: [
      'Full court access (Tennis & Cricket)',
      'Priority prime-time slot bookings (6 PM - 10 PM)',
      '25% discount at gear shop & cafeteria/bar',
      'Complimentary locker & sauna access',
      '2 free guest passes per month',
    ],
    recommended: true,
  },
  {
    id: 'Silver',
    name: 'Silver Member',
    badge: 'Standard',
    badgeColor: 'badge-neutral',
    pricePerMonth: 2499,
    pricePerYear: 24999,
    description: 'Standard access for regular players and sports enthusiasts.',
    perks: [
      'Standard court booking access',
      '10% discount at gear shop & cafeteria',
      'Access to Friday social play sessions',
      'Free equipment stringing inspection',
    ],
  },
  {
    id: 'Junior',
    name: 'Junior Member',
    badge: 'Under 18',
    badgeColor: 'badge-info',
    pricePerMonth: 1499,
    pricePerYear: 14999,
    description: 'Special subsidized membership for youth players and budding athletes under 18.',
    perks: [
      'Discounted afternoon court slots',
      'Weekend youth coaching clinics access',
      'Free entry to junior club tournaments',
      '15% discount on youth apparel & rackets',
    ],
  },
];

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;

// Signup Schema
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .max(100, 'First name cannot exceed 100 characters'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .max(100, 'Last name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(255),
    phone: z
      .string()
      .trim()
      .min(10, 'Phone must be at least 10 digits')
      .regex(/^[0-9+\s-]{10,15}$/, 'Invalid phone number format'),
    dob: z
      .string()
      .min(1, 'Date of birth is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    // Address fields matching member_address table
    addrLine1: z
      .string()
      .trim()
      .min(1, 'Address line 1 is required')
      .max(255, 'Address line 1 cannot exceed 255 characters'),
    addrLine2: z.string().trim().max(255).optional().or(z.literal('')),
    city: z
      .string()
      .trim()
      .min(1, 'City is required')
      .max(100, 'City cannot exceed 100 characters'),
    state: z
      .string()
      .trim()
      .min(1, 'State is required')
      .max(100, 'State cannot exceed 100 characters'),
    pincode: z
      .string()
      .trim()
      .regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),

    // Tier
    tier: z.enum(['Gold', 'Silver', 'Junior'] as const, {
      errorMap: () => ({ message: 'Please select a membership tier' }),
    }),

    // Payment Method
    paymentMethod: z.enum(['cash', 'card', 'upi'] as const, {
      errorMap: () => ({ message: 'Please select a payment method' }),
    }),

    // Optional Card Details (required when paymentMethod === 'card')
    cardNumber: z.string().optional(),
    cardHolder: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.paymentMethod === 'card') {
        const cleanNumber = (data.cardNumber || '').replace(/\s+/g, '');
        return cleanNumber.length >= 15 && cleanNumber.length <= 19;
      }
      return true;
    },
    {
      message: 'Please enter a valid 16-digit card number',
      path: ['cardNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === 'card') {
        return Boolean(data.cardHolder && data.cardHolder.trim().length >= 3);
      }
      return true;
    },
    {
      message: 'Cardholder name is required',
      path: ['cardHolder'],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === 'card') {
        return Boolean(data.cardExpiry && /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(data.cardExpiry));
      }
      return true;
    },
    {
      message: 'Card expiry must be in MM/YY format',
      path: ['cardExpiry'],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === 'card') {
        return Boolean(data.cardCvv && /^[0-9]{3,4}$/.test(data.cardCvv));
      }
      return true;
    },
    {
      message: 'CVV must be 3 or 4 digits',
      path: ['cardCvv'],
    }
  );

export type SignupDto = z.infer<typeof signupSchema>;

// Forgot Password Step 1 Schema
export const forgotPasswordEmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export type ForgotPasswordEmailDto = z.infer<typeof forgotPasswordEmailSchema>;

// Forgot Password Step 2 Schema
export const forgotPasswordOtpSchema = z.object({
  otp: z.string().length(6, 'Please enter the complete 6-digit OTP'),
});

export type ForgotPasswordOtpDto = z.infer<typeof forgotPasswordOtpSchema>;

// Forgot Password Step 3 Schema
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
