import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;

export const revenueReportQuerySchema = z.object({
  from: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
  to: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
});

export type RevenueReportQuery = z.infer<typeof revenueReportQuerySchema>;

export const courtsReportQuerySchema = z.object({
  from: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
  to: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
});

export type CourtsReportQuery = z.infer<typeof courtsReportQuerySchema>;

export const membersReportQuerySchema = z.object({
  from: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
  to: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
});

export type MembersReportQuery = z.infer<typeof membersReportQuerySchema>;

export const inventoryReportQuerySchema = z.object({
  from: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
  to: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
});

export type InventoryReportQuery = z.infer<typeof inventoryReportQuerySchema>;

export const barReportQuerySchema = z.object({
  date: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
});

export type BarReportQuery = z.infer<typeof barReportQuerySchema>;

export const staffReportQuerySchema = z.object({
  from: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
  to: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
});

export type StaffReportQuery = z.infer<typeof staffReportQuerySchema>;

export const earningsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'all']).default('today').optional(),
});

export type EarningsQuery = z.infer<typeof earningsQuerySchema>;

export const barAnalyticsQuerySchema = z.object({
  from: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
  to: z
    .string()
    .regex(isoDateRegex, 'Invalid ISO date string')
    .optional(),
  period: z.enum(['today', 'week', 'month', 'year', 'all']).optional(),
});

export type BarAnalyticsQuery = z.infer<typeof barAnalyticsQuerySchema>;
