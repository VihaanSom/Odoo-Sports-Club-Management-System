import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const tabIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

export const listTabsQuerySchema = z.object({
  status: z.enum(['open', 'settled']).default('open'),
  barTableId: z.coerce.number().int().positive().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
    .optional(),
});

export const openTabSchema = z.object({
  barTableId: z
    .number({ message: 'barTableId is required' })
    .int('barTableId must be an integer')
    .positive('barTableId must be positive'),
  memberId: z.number().int().positive('memberId must be positive').nullable().optional(),
  notes: z.string().max(500, 'notes cannot exceed 500 characters').nullable().optional(),
});

export const addTabItemsSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z
          .number({ message: 'menuItemId is required' })
          .int('menuItemId must be an integer')
          .positive('menuItemId must be positive'),
        qty: z
          .number({ message: 'qty is required' })
          .int('qty must be an integer')
          .min(1, 'qty must be at least 1')
          .max(99, 'qty cannot exceed 99'),
      }),
      { message: 'items array is required' }
    )
    .min(1, 'items must have at least 1 item')
    .max(30, 'items cannot exceed 30 items per request'),
});

export const settleTabSchema = z.object({
  paymentMethod: z.enum([PaymentMethod.cash, PaymentMethod.card, PaymentMethod.upi], {
    message: 'paymentMethod must be one of: cash, card, upi',
  }),
  referenceNo: z.string().max(100, 'referenceNo cannot exceed 100 characters').nullable().optional(),
});

export type TabIdParam = z.infer<typeof tabIdParamSchema>;
export type ListTabsQuery = z.infer<typeof listTabsQuerySchema>;
export type OpenTabInput = z.infer<typeof openTabSchema>;
export type AddTabItemsInput = z.infer<typeof addTabItemsSchema>;
export type SettleTabInput = z.infer<typeof settleTabSchema>;
