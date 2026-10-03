import { z } from 'zod';
import { MembershipTier, MembershipStatus, PaymentMethod } from '@prisma/client';
import { addressBodySchema } from './address.validator';

export const memberIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

export const listMembersQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  pageSize: z.coerce.number().int().min(1).max(100, 'pageSize cannot exceed 100').default(20),
  search: z.string().max(100, 'search query cannot exceed 100 characters').optional(),
  tier: z.enum([MembershipTier.Gold, MembershipTier.Silver, MembershipTier.Junior]).optional(),
  status: z.enum([MembershipStatus.active, MembershipStatus.expired]).optional(),
  sortBy: z
    .enum(['created_at', 'first_name', 'last_name', 'membership_end'], {
      message: 'sortBy must be one of: created_at, first_name, last_name, membership_end',
    })
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createMemberSchema = z.object({
  firstName: z
    .string({ message: 'firstName is required' })
    .min(1, 'firstName cannot be empty')
    .max(100, 'firstName cannot exceed 100 characters'),
  lastName: z
    .string({ message: 'lastName is required' })
    .min(1, 'lastName cannot be empty')
    .max(100, 'lastName cannot exceed 100 characters'),
  email: z
    .string({ message: 'email is required' })
    .email('email must be a valid email address')
    .max(255, 'email cannot exceed 255 characters'),
  password: z
    .string({ message: 'password is required' })
    .min(8, 'password must be at least 8 characters')
    .max(128, 'password cannot exceed 128 characters'),
  phone: z.string().max(20, 'phone cannot exceed 20 characters').nullable().optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateOfBirth must be in YYYY-MM-DD format')
    .refine((val) => new Date(val) < new Date(), { message: 'dateOfBirth must be in the past' })
    .nullable()
    .optional(),
  tier: z.enum([MembershipTier.Gold, MembershipTier.Silver, MembershipTier.Junior], {
    message: 'tier must be one of: Gold, Silver, Junior',
  }),
  planId: z.coerce.number().int().positive('planId must be a positive integer'),
  address: addressBodySchema.nullable().optional(),
  photoUrl: z.string().max(500, 'photoUrl cannot exceed 500 characters').nullable().optional(),
});

export const updateMemberSchema = z
  .object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().email('email must be a valid email address').max(255).optional(),
    phone: z.string().max(20).nullable().optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateOfBirth must be in YYYY-MM-DD format')
      .refine((val) => new Date(val) < new Date(), { message: 'dateOfBirth must be in the past' })
      .nullable()
      .optional(),
    tier: z.enum([MembershipTier.Gold, MembershipTier.Silver, MembershipTier.Junior]).optional(),
    photoUrl: z.string().max(500).nullable().optional(),

    // Immutable fields rejected if provided
    id: z.never({ message: 'id is immutable' }).optional(),
    membershipStart: z.never({ message: 'membershipStart is immutable' }).optional(),
    membershipEnd: z.never({ message: 'membershipEnd is immutable' }).optional(),
    status: z.never({ message: 'status is immutable' }).optional(),
    createdAt: z.never({ message: 'createdAt is immutable' }).optional(),
    password: z.never({ message: 'password cannot be updated via this endpoint' }).optional(),
    planId: z.never({ message: 'planId cannot be updated directly; use renew endpoint' }).optional(),
    address: z.never({ message: 'address must be updated via /members/:id/address' }).optional(),
  })
  .refine(
    (data) => {
      const keys = Object.keys(data).filter((k) => (data as any)[k] !== undefined);
      return keys.length > 0;
    },
    { message: 'At least one field must be provided to update' }
  );

export const renewMemberSchema = z.object({
  durationMonths: z
    .number({ message: 'durationMonths is required' })
    .int('durationMonths must be an integer')
    .min(1, 'durationMonths must be between 1 and 36')
    .max(36, 'durationMonths must be between 1 and 36'),
  paymentMethod: z.enum([PaymentMethod.cash, PaymentMethod.card, PaymentMethod.upi], {
    message: 'paymentMethod must be one of: cash, card, upi',
  }),
  amountPaise: z
    .number({ message: 'amountPaise is required' })
    .int('amountPaise must be an integer')
    .min(0, 'amountPaise cannot be negative'),
  referenceNo: z.string().max(100, 'referenceNo cannot exceed 100 characters').optional(),
});

export const memberHistoryQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be in YYYY-MM-DD format')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be in YYYY-MM-DD format')
    .optional(),
});

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type RenewMemberInput = z.infer<typeof renewMemberSchema>;
export type MemberHistoryQuery = z.infer<typeof memberHistoryQuerySchema>;
