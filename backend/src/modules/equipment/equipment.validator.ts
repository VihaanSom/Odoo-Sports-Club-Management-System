import { z } from 'zod';
import { EquipmentCategory } from '@prisma/client';

export const equipmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

export const listEquipmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  pageSize: z.coerce.number().int().min(1).max(100, 'pageSize cannot exceed 100').default(20),
  category: z
    .enum(
      [
        EquipmentCategory.racket,
        EquipmentCategory.ball,
        EquipmentCategory.shoe,
        EquipmentCategory.accessory,
        EquipmentCategory.apparel,
      ],
      { message: 'category must be one of: racket, ball, shoe, accessory, apparel' }
    )
    .optional(),
  isActive: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean().optional())
    .default(true),
  search: z.string().max(100, 'search cannot exceed 100 characters').optional(),
  sortBy: z
    .enum(['name', 'price', 'stock_qty', 'created_at'], {
      message: 'sortBy must be one of: name, price, stock_qty, created_at',
    })
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const createEquipmentSchema = z.object({
  name: z
    .string({ message: 'name is required' })
    .min(1, 'name cannot be empty')
    .max(200, 'name cannot exceed 200 characters'),
  category: z.enum(
    [
      EquipmentCategory.racket,
      EquipmentCategory.ball,
      EquipmentCategory.shoe,
      EquipmentCategory.accessory,
      EquipmentCategory.apparel,
    ],
    { message: 'category must be one of: racket, ball, shoe, accessory, apparel' }
  ),
  brand: z.string().max(100, 'brand cannot exceed 100 characters').nullable().optional(),
  description: z.string().max(1000, 'description cannot exceed 1000 characters').nullable().optional(),
  pricePaise: z
    .number({ message: 'pricePaise is required' })
    .int('pricePaise must be an integer')
    .min(0, 'pricePaise cannot be negative'),
  stockQty: z
    .number({ message: 'stockQty is required' })
    .int('stockQty must be an integer')
    .min(0, 'stockQty cannot be negative'),
  lowStockThreshold: z
    .number()
    .int('lowStockThreshold must be an integer')
    .min(0, 'lowStockThreshold cannot be negative')
    .default(5),
  imageUrl: z.string().max(500, 'imageUrl cannot exceed 500 characters').nullable().optional(),
});

export const updateEquipmentSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    category: z
      .enum([
        EquipmentCategory.racket,
        EquipmentCategory.ball,
        EquipmentCategory.shoe,
        EquipmentCategory.accessory,
        EquipmentCategory.apparel,
      ])
      .optional(),
    brand: z.string().max(100).nullable().optional(),
    description: z.string().max(1000).nullable().optional(),
    pricePaise: z.number().int().min(0, 'pricePaise cannot be negative').optional(),
    stockQty: z.number().int().min(0, 'stockQty cannot be negative').optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    imageUrl: z.string().max(500).nullable().optional(),

    // Immutable fields rejected if provided
    id: z.never({ message: 'id is immutable' }).optional(),
    createdAt: z.never({ message: 'createdAt is immutable' }).optional(),
  })
  .refine(
    (data) => {
      const keys = Object.keys(data).filter((k) => (data as any)[k] !== undefined);
      return keys.length > 0;
    },
    { message: 'At least one field must be provided to update' }
  );

export const adjustStockSchema = z.object({
  adjustmentQty: z.coerce.number().int({ message: 'adjustmentQty must be an integer' }),
  reason: z.string().max(250).optional(),
});

export type ListEquipmentQuery = z.infer<typeof listEquipmentQuerySchema>;
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
