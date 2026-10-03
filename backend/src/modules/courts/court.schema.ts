import { z } from 'zod';
import { SportType } from '@prisma/client';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const listCourtsQuerySchema = z.object({
  sport: z.nativeEnum(SportType).optional(),
  isActive: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return val;
    }, z.boolean().optional())
    .optional(),
});

export type ListCourtsQuery = z.infer<typeof listCourtsQuerySchema>;

export const courtIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Court ID must be a positive integer'),
});

export type CourtIdParam = z.infer<typeof courtIdParamSchema>;

export const createCourtSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Court name is required')
      .max(50, 'Court name cannot exceed 50 characters'),
    sport: z.nativeEnum(SportType, {
      message: "Sport must be either 'tennis' or 'cricket'",
    }),
    openTime: z
      .string()
      .regex(TIME_REGEX, 'openTime must be in HH:mm format (00:00 to 23:59)')
      .default('00:00'),
    closeTime: z
      .string()
      .regex(TIME_REGEX, 'closeTime must be in HH:mm format (00:00 to 23:59)')
      .default('23:30'),
  })
  .refine((data) => data.closeTime > data.openTime, {
    message: 'closeTime must be after openTime',
    path: ['closeTime'],
  });

export type CreateCourtInput = z.infer<typeof createCourtSchema>;

export const updateCourtSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Court name cannot be empty')
      .max(50, 'Court name cannot exceed 50 characters')
      .optional(),
    openTime: z
      .string()
      .regex(TIME_REGEX, 'openTime must be in HH:mm format')
      .optional(),
    closeTime: z
      .string()
      .regex(TIME_REGEX, 'closeTime must be in HH:mm format')
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.openTime && data.closeTime) {
        return data.closeTime > data.openTime;
      }
      return true;
    },
    {
      message: 'closeTime must be after openTime',
      path: ['closeTime'],
    }
  );

export type UpdateCourtInput = z.infer<typeof updateCourtSchema>;

export const courtAvailabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .refine((val) => {
      const parsed = new Date(`${val}T00:00:00Z`);
      return !isNaN(parsed.getTime());
    }, 'Invalid date value'),
  sport: z.nativeEnum(SportType).optional(),
});

export type CourtAvailabilityQuery = z.infer<typeof courtAvailabilityQuerySchema>;
