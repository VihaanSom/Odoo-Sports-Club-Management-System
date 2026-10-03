import { z } from 'zod';

export const tableIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

export const createTableSchema = z.object({
  tableNo: z
    .string({ message: 'tableNo is required' })
    .trim()
    .min(1, 'tableNo cannot be empty')
    .max(10, 'tableNo cannot exceed 10 characters'),
  capacity: z
    .number()
    .int('capacity must be an integer')
    .min(1, 'capacity must be at least 1')
    .default(4),
  isActive: z.boolean().default(true),
});

export const updateTableSchema = z
  .object({
    tableNo: z
      .string()
      .trim()
      .min(1, 'tableNo cannot be empty')
      .max(10, 'tableNo cannot exceed 10 characters')
      .optional(),
    capacity: z
      .number()
      .int('capacity must be an integer')
      .min(1, 'capacity must be at least 1')
      .optional(),
    isActive: z.boolean().optional(),
    id: z.never({ message: 'id is immutable' }).optional(),
  })
  .refine(
    (data) => {
      const keys = Object.keys(data).filter((k) => (data as any)[k] !== undefined);
      return keys.length > 0;
    },
    { message: 'At least one field must be provided to update' }
  );

export type TableIdParam = z.infer<typeof tableIdParamSchema>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
