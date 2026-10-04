import { z } from 'zod';
import { BookingType, BookingStatus, PaymentMethod } from '@prisma/client';

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional(),
  courtId: z.coerce.number().int().positive().optional(),
  memberId: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  bookingType: z.nativeEnum(BookingType).optional(),
  sortBy: z.enum(['slot_start', 'created_at']).default('slot_start'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;

export const bookingIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Booking ID must be a positive integer'),
});

export type BookingIdParam = z.infer<typeof bookingIdParamSchema>;

const slotBoundaryRefinement = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const minutes = d.getUTCMinutes();
  const seconds = d.getUTCSeconds();
  const millis = d.getUTCMilliseconds();
  return (minutes === 0 || minutes === 30) && seconds === 0 && millis === 0;
};

export const createBookingSchema = z
  .object({
    courtId: z.coerce.number().int().positive('courtId must be a positive integer'),
    memberId: z.coerce.number().int().positive().nullable().optional(),
    guestName: z.string().trim().max(150, 'guestName cannot exceed 150 characters').nullable().optional(),
    guestPhone: z.string().trim().max(20, 'guestPhone cannot exceed 20 characters').nullable().optional(),
    slotStart: z
      .string()
      .datetime({ message: 'slotStart must be a valid ISO 8601 UTC string' })
      .refine(slotBoundaryRefinement, {
        message: 'slotStart must align to a 30-minute boundary (e.g. 06:00, 06:30)',
      }),
    slotEnd: z
      .string()
      .datetime({ message: 'slotEnd must be a valid ISO 8601 UTC string' }),
    bookingType: z.enum(['member', 'walk_in']),
    paymentMethod: z.nativeEnum(PaymentMethod, {
      message: "paymentMethod must be one of 'cash', 'card', 'upi', 'plan'",
    }),
    notes: z.string().max(500, 'notes cannot exceed 500 characters').nullable().optional(),
  })
  .refine(
    (data) => {
      const startMs = new Date(data.slotStart).getTime();
      const endMs = new Date(data.slotEnd).getTime();
      return endMs - startMs === 60 * 60 * 1000;
    },
    {
      message: 'slotEnd must be exactly 60 minutes after slotStart',
      path: ['slotEnd'],
    }
  )
  .refine(
    (data) => {
      if (data.bookingType === 'member') {
        return data.memberId !== undefined && data.memberId !== null;
      }
      return true;
    },
    {
      message: "memberId is required when bookingType is 'member'",
      path: ['memberId'],
    }
  )
  .refine(
    (data) => {
      if (data.bookingType === 'walk_in') {
        return !!data.guestName && data.guestName.trim().length > 0;
      }
      return true;
    },
    {
      message: "guestName is required when bookingType is 'walk_in'",
      path: ['guestName'],
    }
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().max(500, 'reason cannot exceed 500 characters').optional(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export const socialParticipantSchema = z
  .object({
    memberId: z.coerce.number().int().positive().optional(),
    guestName: z.string().trim().max(150).optional(),
  })
  .refine((data) => data.memberId !== undefined || (data.guestName !== undefined && data.guestName.length > 0), {
    message: 'Each participant must have either memberId or guestName',
  });

export const createSocialBookingSchema = z
  .object({
    courtId: z.coerce.number().int().positive('courtId must be a positive integer'),
    slotStart: z
      .string()
      .datetime({ message: 'slotStart must be a valid ISO 8601 UTC string' })
      .refine(slotBoundaryRefinement, {
        message: 'slotStart must align to a 30-minute boundary (e.g. 06:00, 06:30)',
      }),
    slotEnd: z
      .string()
      .datetime({ message: 'slotEnd must be a valid ISO 8601 UTC string' }),
    paymentMethod: z.enum(['cash', 'card', 'upi']),
    participants: z
      .array(socialParticipantSchema)
      .min(2, 'Social booking requires at least 2 participants')
      .max(20, 'Social booking allows at most 20 participants'),
    notes: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) => {
      const startMs = new Date(data.slotStart).getTime();
      const endMs = new Date(data.slotEnd).getTime();
      return endMs - startMs === 60 * 60 * 1000;
    },
    {
      message: 'slotEnd must be exactly 60 minutes after slotStart',
      path: ['slotEnd'],
    }
  );

export type CreateSocialBookingInput = z.infer<typeof createSocialBookingSchema>;

export const todayBookingsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional(),
});

export type TodayBookingsQuery = z.infer<typeof todayBookingsQuerySchema>;
