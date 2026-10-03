import { z } from 'zod';
import { StaffRole, LeaveStatus } from '@prisma/client';

export const listStaffQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  role: z.nativeEnum(StaffRole).optional(),
  isActive: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
      }
      return val;
    }, z.boolean())
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'role', 'salary']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListStaffQuery = z.infer<typeof listStaffQuerySchema>;

export const createStaffSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
  role: z.nativeEnum(StaffRole),
  phone: z.string().trim().max(20).optional().nullable(),
  salary: z.number().int().min(0, 'Salary must be a non-negative integer (in paise)').optional().nullable(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    phone: z.string().trim().max(20).optional().nullable(),
    role: z.nativeEnum(StaffRole).optional(),
    salary: z.number().int().min(0).optional().nullable(),
    isActive: z.boolean().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters long').max(128).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

export const staffIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid staff ID'),
});

export const startShiftSchema = z.object({
  notes: z.string().trim().max(500).optional().nullable(),
});

export type StartShiftInput = z.infer<typeof startShiftSchema>;

export const endShiftSchema = z.object({
  notes: z.string().trim().max(500).optional().nullable(),
});

export type EndShiftInput = z.infer<typeof endShiftSchema>;

export const shiftParamsSchema = z.object({
  id: z.coerce.number().int().positive('Invalid staff ID'),
  shiftId: z.coerce.number().int().positive('Invalid shift ID'),
});

export const assignShiftSchema = z.object({
  staffId: z.coerce.number().int().positive('staffId is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'startTime must be in HH:mm format'),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'endTime must be in HH:mm format'),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type AssignShiftInput = z.infer<typeof assignShiftSchema>;

export const clockShiftSchema = z.object({
  shiftId: z.coerce.number().int().positive('shiftId must be a positive integer'),
  action: z.enum(['clock_in', 'clock_out']),
  timestamp: z.string().optional(),
});

export type ClockShiftInput = z.infer<typeof clockShiftSchema>;

export const listShiftsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  staffId: z.coerce.number().int().positive().optional(),
  role: z.nativeEnum(StaffRole).optional(),
});

export type ListShiftsQuery = z.infer<typeof listShiftsQuerySchema>;

export const createLeaveSchema = z
  .object({
    staffId: z.coerce.number().int().positive().optional(),
    fromDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'fromDate must be in YYYY-MM-DD format')
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD format')
      .optional(),
    toDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'toDate must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD format')
      .optional(),
    leaveType: z.string().optional(),
    reason: z.string().trim().max(500).optional().nullable(),
  })
  .refine((data) => Boolean(data.fromDate || data.startDate), {
    message: 'fromDate or startDate is required',
    path: ['fromDate'],
  })
  .refine((data) => Boolean(data.toDate || data.endDate), {
    message: 'toDate or endDate is required',
    path: ['toDate'],
  })
  .refine(
    (data) => {
      const from = data.fromDate || data.startDate!;
      const to = data.toDate || data.endDate!;
      return new Date(to) >= new Date(from);
    },
    {
      message: 'toDate must be greater than or equal to fromDate',
      path: ['toDate'],
    }
  );

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;

export const listLeaveQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(LeaveStatus).optional(),
});

export type ListLeaveQuery = z.infer<typeof listLeaveQuerySchema>;

export const reviewLeaveSchema = z.object({
  status: z.enum([LeaveStatus.approved, LeaveStatus.rejected], {
    message: "status must be either 'approved' or 'rejected'",
  }),
  remarks: z.string().trim().max(500).optional().nullable(),
});

export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;

export const leaveIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid leave request ID'),
});

