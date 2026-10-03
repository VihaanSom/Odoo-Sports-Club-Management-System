import bcrypt from 'bcryptjs';
import { Prisma, Staff, Shift, LeaveRequest, StaffRole, LeaveStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../../utils/errors';
import {
  ListStaffQuery,
  CreateStaffInput,
  UpdateStaffInput,
  StartShiftInput,
  EndShiftInput,
  AssignShiftInput,
  ClockShiftInput,
  ListShiftsQuery,
  CreateLeaveInput,
  ListLeaveQuery,
  ReviewLeaveInput,
} from './staff.validator';

export interface StaffResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  phone: string | null;
  salaryPaise?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const formatStaff = (staff: Staff, includeSalary = false): StaffResponse => {
  const res: StaffResponse = {
    id: staff.id,
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    role: staff.role,
    phone: staff.phone,
    isActive: staff.isActive,
    createdAt: staff.createdAt.toISOString(),
    updatedAt: staff.updatedAt.toISOString(),
  };

  if (includeSalary) {
    res.salaryPaise =
      staff.salary !== null ? Math.round(Number(staff.salary) * 100) : null;
  }

  return res;
};

export const formatShift = (shift: Shift & { staff?: any }) => {
  const dateStr = shift.shiftDate.toISOString().split('T')[0];
  const startTime = shift.shiftStart ? new Date(shift.shiftStart).toISOString().slice(11, 16) : '08:00';
  const endTime = shift.shiftEnd ? new Date(shift.shiftEnd).toISOString().slice(11, 16) : '17:00';

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const notes = shift.notes || '';
  const isClockedIn = notes.includes('[Clocked In]');
  const isClockedOut = notes.includes('[Clocked Out]');

  let status: 'scheduled' | 'in_progress' | 'completed' = 'scheduled';
  let clockInTime: string | undefined = undefined;
  let clockOutTime: string | undefined = undefined;

  if (isClockedOut) {
    status = 'completed';
    clockInTime = shift.shiftStart
      ? new Date(shift.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined;
    clockOutTime = shift.shiftEnd
      ? new Date(shift.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined;
  } else if (shift.shiftEnd === null || isClockedIn) {
    status = 'in_progress';
    clockInTime = shift.shiftStart
      ? new Date(shift.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined;
    clockOutTime = undefined;
  } else if (dateStr > todayStr || new Date(shift.shiftStart).getTime() > now.getTime()) {
    status = 'scheduled';
    clockInTime = undefined;
    clockOutTime = undefined;
  } else if (dateStr === todayStr) {
    status = 'scheduled';
    clockInTime = undefined;
    clockOutTime = undefined;
  } else {
    status = 'completed';
    clockInTime = shift.shiftStart
      ? new Date(shift.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined;
    clockOutTime = shift.shiftEnd
      ? new Date(shift.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined;
  }

  return {
    id: String(shift.id),
    staffId: String(shift.staffId),
    staffName: shift.staff ? `${shift.staff.firstName} ${shift.staff.lastName}`.trim() : `Staff #${shift.staffId}`,
    role: shift.staff?.role || 'front_desk',
    date: dateStr,
    shiftDate: dateStr,
    startTime,
    endTime,
    shiftStart: shift.shiftStart.toISOString(),
    shiftEnd: shift.shiftEnd ? shift.shiftEnd.toISOString() : null,
    status,
    clockInTime,
    clockOutTime,
    notes: shift.notes,
    createdAt: shift.createdAt.toISOString(),
  };
};

export const formatLeave = (leave: LeaveRequest & { staff?: any; reviewer?: any }) => {
  const fromDateStr = leave.fromDate.toISOString().split('T')[0];
  const toDateStr = leave.toDate.toISOString().split('T')[0];
  const diffDays = Math.max(
    1,
    Math.round((new Date(toDateStr).getTime() - new Date(fromDateStr).getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return {
    id: String(leave.id),
    staffId: String(leave.staffId),
    staffName: leave.staff ? `${leave.staff.firstName} ${leave.staff.lastName}`.trim() : `Staff #${leave.staffId}`,
    role: leave.staff?.role || 'front_desk',
    leaveType: 'casual',
    startDate: fromDateStr,
    endDate: toDateStr,
    fromDate: fromDateStr,
    toDate: toDateStr,
    daysCount: diffDays,
    reason: leave.reason || '',
    status: leave.status,
    appliedOn: leave.createdAt.toISOString().split('T')[0],
    reviewedBy: leave.reviewer
      ? `${leave.reviewer.firstName} ${leave.reviewer.lastName}`.trim()
      : (leave.reviewedBy ? String(leave.reviewedBy) : undefined),
    reviewedAt: leave.reviewedAt ? leave.reviewedAt.toISOString() : null,
    createdAt: leave.createdAt.toISOString(),
    ...(leave.staff && {
      staff: {
        id: leave.staff.id,
        firstName: leave.staff.firstName,
        lastName: leave.staff.lastName,
        email: leave.staff.email,
        role: leave.staff.role,
      },
    }),
    ...(leave.reviewer && {
      reviewer: {
        id: leave.reviewer.id,
        firstName: leave.reviewer.firstName,
        lastName: leave.reviewer.lastName,
      },
    }),
  };
};


export class StaffService {
  /**
   * ST-01: List staff members with pagination, role & active filtering, and search.
   */
  async listStaff(query: ListStaffQuery, isAdmin = true) {
    const where: Prisma.StaffWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [staffList, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take,
      }),
      prisma.staff.count({ where }),
    ]);

    return {
      data: staffList.map((s) => formatStaff(s, isAdmin)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 0,
      },
    };
  }

  /**
   * ST-03: Get staff details by ID.
   */
  async getStaffById(id: number, isAdmin = false) {
    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', `Staff member with ID ${id} not found.`);
    }

    return formatStaff(staff, isAdmin);
  }

  /**
   * ST-02: Create new staff member.
   * Enforces email uniqueness across BOTH staff and members tables.
   */
  async createStaff(input: CreateStaffInput) {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check email uniqueness across both staff and members
    const [existingMember, existingStaff] = await Promise.all([
      prisma.member.findUnique({ where: { email: normalizedEmail } }),
      prisma.staff.findUnique({ where: { email: normalizedEmail } }),
    ]);

    if (existingMember || existingStaff) {
      throw new ConflictError(
        'DUPLICATE_EMAIL',
        `Email '${input.email}' is already registered.`
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const salaryDecimal =
      input.salary !== undefined && input.salary !== null
        ? new Prisma.Decimal(input.salary).div(100)
        : null;

    const staff = await prisma.staff.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: normalizedEmail,
        passwordHash,
        role: input.role,
        phone: input.phone || null,
        salary: salaryDecimal,
        isActive: true,
      },
    });

    return formatStaff(staff, true);
  }

  /**
   * ST-04: Update staff member details.
   */
  async updateStaff(id: number, input: UpdateStaffInput) {
    const existing = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('STAFF_NOT_FOUND', `Staff member with ID ${id} not found.`);
    }

    const data: Prisma.StaffUpdateInput = {};

    if (input.firstName !== undefined) data.firstName = input.firstName;
    if (input.lastName !== undefined) data.lastName = input.lastName;
    if (input.phone !== undefined) data.phone = input.phone || null;
    if (input.role !== undefined) data.role = input.role;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    if (input.salary !== undefined) {
      data.salary =
        input.salary !== null ? new Prisma.Decimal(input.salary).div(100) : null;
    }

    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 12);
    }

    const updated = await prisma.staff.update({
      where: { id },
      data,
    });

    return formatStaff(updated, true);
  }

  /**
   * SH-01: Start (clock-in) a shift.
   */
  async startShift(staffId: number, input: StartShiftInput) {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', `Staff member with ID ${staffId} not found.`);
    }

    if (!staff.isActive) {
      throw new ForbiddenError('ACCOUNT_INACTIVE', 'Staff account is inactive.');
    }

    // Business rule: If staff already has an open shift (shift_end = null) -> 409
    const activeShift = await prisma.shift.findFirst({
      where: {
        staffId,
        shiftEnd: null,
      },
    });

    if (activeShift) {
      throw new ConflictError(
        'SHIFT_ALREADY_ACTIVE',
        `Staff member already has an active shift started at ${activeShift.shiftStart.toISOString()}.`
      );
    }

    const now = new Date();
    // Midnight date for shiftDate
    const shiftDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const shift = await prisma.shift.create({
      data: {
        staffId,
        shiftDate,
        shiftStart: now,
        shiftEnd: null,
        notes: input.notes || null,
      },
    });

    return formatShift(shift);
  }

  /**
   * SH-02: End (clock-out) a shift.
   */
  async endShift(staffId: number, shiftId: number, input: EndShiftInput) {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift || shift.staffId !== staffId) {
      throw new NotFoundError(
        'SHIFT_NOT_FOUND',
        `Active shift with ID ${shiftId} not found for this staff member.`
      );
    }

    if (shift.shiftEnd !== null) {
      throw new ConflictError(
        'SHIFT_ALREADY_ENDED',
        `Shift with ID ${shiftId} has already ended at ${shift.shiftEnd.toISOString()}.`
      );
    }

    const now = new Date();
    const updatedNotes = input.notes !== undefined
      ? (shift.notes ? `${shift.notes} | ${input.notes}` : input.notes)
      : shift.notes;

    const updated = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        shiftEnd: now,
        notes: updatedNotes,
      },
    });

    return formatShift(updated);
  }

  /**
   * List shifts for a specific staff member.
   */
  async getStaffShifts(staffId: number, page = 1, pageSize = 20) {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', `Staff member with ID ${staffId} not found.`);
    }

    const skip = (page - 1) * pageSize;
    const [shifts, total] = await Promise.all([
      prisma.shift.findMany({
        where: { staffId },
        orderBy: { shiftStart: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.shift.count({ where: { staffId } }),
    ]);

    return {
      data: shifts.map(formatShift),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 0,
      },
    };
  }

  /**
   * LV-01: Submit a leave request.
   */
  async submitLeaveRequest(staffId: number, input: CreateLeaveInput) {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', `Staff member with ID ${staffId} not found.`);
    }

    if (!staff.isActive) {
      throw new ForbiddenError('ACCOUNT_INACTIVE', 'Staff account is inactive.');
    }

    const fromDateStr = input.fromDate || input.startDate!;
    const toDateStr = input.toDate || input.endDate!;
    const fromDate = new Date(`${fromDateStr}T00:00:00.000Z`);
    const toDate = new Date(`${toDateStr}T00:00:00.000Z`);

    const leave = await prisma.leaveRequest.create({
      data: {
        staffId,
        fromDate,
        toDate,
        reason: input.reason || null,
        status: LeaveStatus.pending,
      },
      include: {
        staff: true,
      },
    });

    return formatLeave(leave);
  }

  /**
   * LV-02: Get leave history for a specific staff member.
   */
  async getStaffLeaves(staffId: number, query: ListLeaveQuery) {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', `Staff member with ID ${staffId} not found.`);
    }

    const where: Prisma.LeaveRequestWhereInput = { staffId };
    if (query.status) {
      where.status = query.status;
    }

    const skip = (query.page - 1) * query.pageSize;
    const [leaves, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
        include: {
          reviewer: true,
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return {
      data: leaves.map(formatLeave),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 0,
      },
    };
  }

  /**
   * List all leave requests across the organisation (admin view).
   */
  async listAllLeaves(query: ListLeaveQuery) {
    const where: Prisma.LeaveRequestWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }

    const skip = (query.page - 1) * query.pageSize;
    const [leaves, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
        include: {
          staff: true,
          reviewer: true,
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return {
      data: leaves.map(formatLeave),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 0,
      },
    };
  }

  /**
   * LV-03: Approve or reject a leave request.
   */
  async reviewLeaveRequest(leaveId: number, reviewerId: number, input: ReviewLeaveInput) {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundError('LEAVE_NOT_FOUND', `Leave request with ID ${leaveId} not found.`);
    }

    if (leave.status !== LeaveStatus.pending) {
      throw new ConflictError(
        'LEAVE_ALREADY_REVIEWED',
        `Leave request #${leaveId} has already been reviewed (${leave.status}).`
      );
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: input.status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        staff: true,
        reviewer: true,
      },
    });

    return formatLeave(updated);
  }

  /**
   * List shifts across all staff members (with date, role, or staffId filters).
   */
  async listAllShifts(query: ListShiftsQuery) {
    const where: Prisma.ShiftWhereInput = {};

    if (query.staffId) {
      where.staffId = query.staffId;
    }

    if (query.role) {
      where.staff = { role: query.role };
    }

    if (query.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);
      where.shiftDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const shifts = await prisma.shift.findMany({
      where,
      orderBy: { shiftStart: 'desc' },
      include: {
        staff: true,
      },
    });

    return shifts.map(formatShift);
  }

  /**
   * Assign or schedule a new shift for a staff member.
   */
  async assignShift(input: AssignShiftInput) {
    const staff = await prisma.staff.findUnique({
      where: { id: input.staffId },
    });

    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', `Staff member with ID ${input.staffId} not found.`);
    }

    const shiftDate = new Date(`${input.date}T00:00:00.000Z`);
    const shiftStart = new Date(`${input.date}T${input.startTime}:00.000Z`);
    const shiftEnd = new Date(`${input.date}T${input.endTime}:00.000Z`);

    const shift = await prisma.shift.create({
      data: {
        staffId: input.staffId,
        shiftDate,
        shiftStart,
        shiftEnd,
        notes: input.notes || null,
      },
      include: {
        staff: true,
      },
    });

    return formatShift(shift);
  }

  /**
   * Clock in or clock out on a shift.
   */
  async clockInOut(input: ClockShiftInput) {
    const shift = await prisma.shift.findUnique({
      where: { id: input.shiftId },
      include: { staff: true },
    });

    if (!shift) {
      throw new NotFoundError('SHIFT_NOT_FOUND', `Shift with ID ${input.shiftId} not found.`);
    }

    const now = new Date();
    const data: Prisma.ShiftUpdateInput = {};
    const existingNotes = shift.notes || '';

    if (input.action === 'clock_in') {
      data.shiftStart = now;
      data.shiftEnd = null;
      data.notes = existingNotes.includes('[Clocked In]')
        ? existingNotes
        : (existingNotes ? `${existingNotes} | [Clocked In]` : '[Clocked In]');
    } else {
      data.shiftEnd = now;
      data.notes = existingNotes.includes('[Clocked Out]')
        ? existingNotes
        : (existingNotes ? `${existingNotes} | [Clocked Out]` : '[Clocked Out]');
    }

    const updated = await prisma.shift.update({
      where: { id: input.shiftId },
      data,
      include: { staff: true },
    });

    return formatShift(updated);
  }
}

export const staffService = new StaffService();

