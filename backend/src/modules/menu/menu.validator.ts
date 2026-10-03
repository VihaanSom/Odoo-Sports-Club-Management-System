import { z } from 'zod';
import { MenuCategory } from '@prisma/client';

export const menuItemIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

export const listMenuItemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  pageSize: z.coerce.number().int().min(1).max(100, 'pageSize cannot exceed 100').default(20),
  category: z
    .enum([MenuCategory.food, MenuCategory.beverage, MenuCategory.snack], {
      message: 'category must be one of: food, beverage, snack',
    })
    .optional(),
  isAvailable: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean().optional())
    .default(true),
  search: z.string().max(100, 'search cannot exceed 100 characters').optional(),
  sortBy: z.enum(['name', 'price', 'created_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const createMenuItemSchema = z.object({
  name: z
    .string({ message: 'name is required' })
    .min(1, 'name cannot be empty')
    .max(200, 'name cannot exceed 200 characters'),
  category: z.enum([MenuCategory.food, MenuCategory.beverage, MenuCategory.snack], {
    message: 'category must be one of: food, beverage, snack',
  }),
  description: z.string().max(500, 'description cannot exceed 500 characters').nullable().optional(),
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

export const updateMenuItemSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    category: z.enum([MenuCategory.food, MenuCategory.beverage, MenuCategory.snack]).optional(),
    description: z.string().max(500).nullable().optional(),
    pricePaise: z.number().int().min(0, 'pricePaise cannot be negative').optional(),
    stockQty: z.number().int().min(0, 'stockQty cannot be negative').optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
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

export type ListMenuItemsQuery = z.infer<typeof listMenuItemsQuerySchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
