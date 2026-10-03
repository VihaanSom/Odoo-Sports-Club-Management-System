import { z } from 'zod';
import { MenuCategory } from '@prisma/client';

export const listMenuItemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.nativeEnum(MenuCategory).optional(),
  isAvailable: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
      }
      return val;
    }, z.boolean())
    .optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['name', 'category', 'price', 'stockQty', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListMenuItemsQuery = z.infer<typeof listMenuItemsQuerySchema>;

export const createMenuItemSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    category: z.nativeEnum(MenuCategory),
    description: z.string().trim().max(500).optional().nullable(),
    pricePaise: z.number().int().min(0, 'pricePaise must be non-negative integer'),
    stockQty: z.number().int().min(0, 'stockQty must be non-negative integer'),
    lowStockThreshold: z.number().int().min(0).default(5),
    imageUrl: z.string().trim().url('Invalid image URL').max(500).optional().nullable(),
  })
  .strict();

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;

export const updateMenuItemSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    category: z.nativeEnum(MenuCategory).optional(),
    description: z.string().trim().max(500).optional().nullable(),
    pricePaise: z.number().int().min(0).optional(),
    stockQty: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
    imageUrl: z.string().trim().url('Invalid image URL').max(500).optional().nullable(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

export const menuItemIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid menu item ID'),
});
