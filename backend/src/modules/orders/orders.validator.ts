import { z } from 'zod';
import { OrderType, OrderStatus, PaymentMethod } from '@prisma/client';

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  pageSize: z.coerce.number().int().min(1).max(100, 'pageSize cannot exceed 100').default(10),
  orderType: z.enum([OrderType.in_store, OrderType.online, OrderType.bar]).optional(),
  status: z
    .enum([
      OrderStatus.pending,
      OrderStatus.confirmed,
      OrderStatus.fulfilled,
      OrderStatus.cancelled,
    ])
    .optional(),
  memberId: z.coerce.number().int().positive().optional(),
  search: z.string().max(100, 'search cannot exceed 100 characters').optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be in YYYY-MM-DD format')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be in YYYY-MM-DD format')
    .optional(),
  sortBy: z.enum(['created_at', 'total_amount', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createOrderSchema = z
  .object({
    memberId: z.coerce.number().int().positive().nullable().optional(),
    orderType: z.enum([OrderType.in_store, OrderType.online, OrderType.bar], {
      message: 'orderType must be one of: in_store, online, bar',
    }),
    paymentMethod: z.enum([PaymentMethod.cash, PaymentMethod.card, PaymentMethod.upi, PaymentMethod.plan], {
      message: 'paymentMethod must be one of: cash, card, upi, plan',
    }),
    deliveryAddress: z.string().max(500, 'deliveryAddress cannot exceed 500 characters').nullable().optional(),
    notes: z.string().max(500, 'notes cannot exceed 500 characters').nullable().optional(),
    items: z
      .array(
        z
          .object({
            equipmentId: z.coerce.number().int().positive().optional(),
            menuItemId: z.coerce.number().int().positive().optional(),
            qty: z.number().int().min(1, 'qty must be at least 1').max(99, 'qty cannot exceed 99'),
          })
          .refine(
            (item) => item.equipmentId !== undefined || item.menuItemId !== undefined,
            { message: 'Item must have either equipmentId or menuItemId' }
          )
      )
      .min(1, 'Order must contain at least 1 item')
      .max(50, 'Order cannot exceed 50 items'),
  })
  .refine(
    (data) => {
      if (data.orderType === OrderType.online) {
        return !!data.deliveryAddress && data.deliveryAddress.trim().length > 0;
      }
      return true;
    },
    {
      message: 'deliveryAddress is required for online orders',
      path: ['deliveryAddress'],
    }
  );

export const updateOrderStatusSchema = z.object({
  status: z.enum([OrderStatus.confirmed, OrderStatus.fulfilled, OrderStatus.cancelled], {
    message: 'status must be one of: confirmed, fulfilled, cancelled',
  }),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
