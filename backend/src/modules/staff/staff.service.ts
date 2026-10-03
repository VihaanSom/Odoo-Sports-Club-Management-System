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

export const formatShift = (shift: Shift) => ({
  id: shift.id,
  staffId: shift.staffId,
  shiftDate: shift.shiftDate.toISOString().split('T')[0],
  shiftStart: shift.shiftStart.toISOString(),
  shiftEnd: shift.shiftEnd ? shift.shiftEnd.toISOString() : null,
  notes: shift.notes,
  createdAt: shift.createdAt.toISOString(),
});

export const formatLeave = (leave: LeaveRequest & { staff?: any; reviewer?: any }) => ({
  id: leave.id,
  staffId: leave.staffId,
  fromDate: leave.fromDate.toISOString().split('T')[0],
  toDate: leave.toDate.toISOString().split('T')[0],
  reason: leave.reason,
  status: leave.status,
  reviewedBy: leave.reviewedBy,
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
});

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

    const fromDate = new Date(`${input.fromDate}T00:00:00.000Z`);
    const toDate = new Date(`${input.toDate}T00:00:00.000Z`);

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
}

export const staffService = new StaffService();
