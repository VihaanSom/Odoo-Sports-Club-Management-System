import { z } from 'zod';

export const memberIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

export const addressBodySchema = z.object({
  addrLine1: z
    .string({ message: 'addrLine1 is required' })
    .min(1, 'addrLine1 cannot be empty')
    .max(255, 'addrLine1 cannot exceed 255 characters'),
  addrLine2: z
    .string()
    .max(255, 'addrLine2 cannot exceed 255 characters')
    .nullable()
    .optional(),
  city: z
    .string()
    .max(100, 'city cannot exceed 100 characters')
    .nullable()
    .optional(),
  state: z
    .string()
    .max(100, 'state cannot exceed 100 characters')
    .nullable()
    .optional(),
  pincode: z
    .string({ message: 'pincode is required' })
    .regex(/^[0-9]{6}$/, 'pincode must be exactly 6 digits'),
});

export type AddressInput = z.infer<typeof addressBodySchema>;
