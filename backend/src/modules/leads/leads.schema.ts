import { z } from 'zod';
import { LeadStatus, MembershipTier, PaymentMethod, SportType, EquipmentCategory } from '@prisma/client';

// ==========================================
// LEAD MANAGEMENT SCHEMAS (LD-01 to LD-03)
// ==========================================

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(LeadStatus).optional(),
  sortBy: z.enum(['created_at', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

export const leadIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Lead ID must be a positive integer'),
});

export type LeadIdParam = z.infer<typeof leadIdParamSchema>;

export const updateLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus, {
    message: "status must be one of 'new', 'contacted', 'converted', 'lost'",
  }),
  assignedTo: z.coerce.number().int().positive().nullable().optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

// ==========================================
// PUBLIC PORTAL SCHEMAS (PU-01 to PU-07)
// ==========================================

export const publicEquipmentQuerySchema = z.object({
  category: z.nativeEnum(EquipmentCategory).optional(),
  search: z.string().trim().max(100).optional(),
});

export type PublicEquipmentQuery = z.infer<typeof publicEquipmentQuerySchema>;

export const publicSlotsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .refine((val) => {
      const parsed = new Date(`${val}T00:00:00Z`);
      return !isNaN(parsed.getTime());
    }, 'Invalid date value'),
  sport: z.nativeEnum(SportType).optional(),
});

export type PublicSlotsQuery = z.infer<typeof publicSlotsQuerySchema>;

export const submitLeadSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(150, 'Name cannot exceed 150 characters'),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .max(255, 'Email cannot exceed 255 characters')
      .nullable()
      .optional(),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone cannot exceed 20 characters')
      .nullable()
      .optional(),
    message: z
      .string()
      .trim()
      .max(2000, 'Message cannot exceed 2000 characters')
      .nullable()
      .optional(),
  })
  .refine((data) => (data.email && data.email.length > 0) || (data.phone && data.phone.length > 0), {
    message: 'At least one of email or phone must be provided',
    path: ['email'],
  });

export type SubmitLeadInput = z.infer<typeof submitLeadSchema>;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const requestTrialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(150, 'Name cannot exceed 150 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone cannot exceed 20 characters')
    .nullable()
    .optional(),
  sport: z.nativeEnum(SportType, {
    message: "Sport must be either 'tennis' or 'cricket'",
  }),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'preferredDate must be formatted as YYYY-MM-DD'),
  preferredTime: z
    .string()
    .regex(TIME_REGEX, 'preferredTime must be in HH:mm format (00:00 to 23:59)')
    .refine(
      (time) => {
        const [_, min] = time.split(':').map(Number);
        return min === 0 || min === 30;
      },
      { message: 'preferredTime must align to 30-min boundary (e.g. 06:00, 06:30)' }
    ),
});

export type RequestTrialInput = z.infer<typeof requestTrialSchema>;

export const publicAddressSchema = z.object({
  addrLine1: z.string().trim().min(1, 'Address line 1 is required').max(150),
  addrLine2: z.string().trim().max(150).nullable().optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
});

export const publicRegisterSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().trim().max(20).nullable().optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateOfBirth must be formatted as YYYY-MM-DD')
    .nullable()
    .optional(),
  tier: z.nativeEnum(MembershipTier, {
    message: "Tier must be one of 'Gold', 'Silver', 'Junior'",
  }),
  planId: z.coerce.number().int().positive('planId must be a positive integer'),
  paymentMethod: z.enum(['cash', 'card', 'upi']),
  referenceNo: z.string().trim().max(100).nullable().optional(),
  address: publicAddressSchema.optional(),
});

export type PublicRegisterInput = z.infer<typeof publicRegisterSchema>;
