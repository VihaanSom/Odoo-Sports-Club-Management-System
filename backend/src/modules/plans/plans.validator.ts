import { z } from 'zod';
import { MembershipTier } from '@prisma/client';

export const planIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

export const createPlanSchema = z.object({
  tier: z.enum([MembershipTier.Gold, MembershipTier.Silver, MembershipTier.Junior], {
    message: 'tier must be one of: Gold, Silver, Junior',
  }),
  durationMonths: z.union([z.literal(1), z.literal(6), z.literal(12)], {
    message: 'durationMonths must be one of: 1, 6, 12',
  }),
  pricePaise: z
    .number({ message: 'pricePaise is required' })
    .int('pricePaise must be an integer')
    .min(0, 'pricePaise cannot be negative'),
  courtRatePaise: z
    .number({ message: 'courtRatePaise is required' })
    .int('courtRatePaise must be an integer')
    .min(0, 'courtRatePaise cannot be negative'),
  shopDiscountPct: z
    .number({ message: 'shopDiscountPct is required' })
    .int('shopDiscountPct must be an integer')
    .min(0, 'shopDiscountPct must be between 0 and 100')
    .max(100, 'shopDiscountPct must be between 0 and 100'),
  barDiscountPct: z
    .number({ message: 'barDiscountPct is required' })
    .int('barDiscountPct must be an integer')
    .min(0, 'barDiscountPct must be between 0 and 100')
    .max(100, 'barDiscountPct must be between 0 and 100'),
});

export const updatePlanSchema = z
  .object({
    pricePaise: z.number().int().min(0, 'pricePaise cannot be negative').optional(),
    courtRatePaise: z.number().int().min(0, 'courtRatePaise cannot be negative').optional(),
    shopDiscountPct: z.number().int().min(0).max(100, 'shopDiscountPct must be between 0 and 100').optional(),
    barDiscountPct: z.number().int().min(0).max(100, 'barDiscountPct must be between 0 and 100').optional(),
    isActive: z.boolean().optional(),
    tier: z.never({ message: 'tier is immutable and cannot be updated' }).optional(),
    durationMonths: z.never({ message: 'durationMonths is immutable and cannot be updated' }).optional(),
  })
  .refine(
    (data) => {
      const keys = Object.keys(data).filter((k) => (data as any)[k] !== undefined);
      return keys.length > 0;
    },
    { message: 'At least one field must be provided to update' }
  );

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
