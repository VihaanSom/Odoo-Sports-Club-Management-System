import bcrypt from 'bcryptjs';
import { Prisma, Member, MembershipStatus, MembershipTier, PaymentMethod } from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  NotFoundError,
  ConflictError,
  UnprocessableError,
  ForbiddenError,
} from '../../utils/errors';
import {
  ListMembersQuery,
  CreateMemberInput,
  UpdateMemberInput,
  RenewMemberInput,
  MemberHistoryQuery,
} from './members.validator';

export const isUnder18 = (dob: Date): boolean => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age < 18;
};

export const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const formatDateOnly = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export class MembersService {
  /**
   * ME-01: List members with pagination, search, and filtering.
   */
  async listMembers(query: ListMembersQuery) {
    const where: Prisma.MemberWhereInput = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tier) {
      where.tier = query.tier;
    }

    if (query.status) {
      where.status = query.status;
    }

    // Map sortBy to schema field name
    const sortFieldMap: Record<string, keyof Prisma.MemberOrderByWithRelationInput> = {
      created_at: 'createdAt',
      first_name: 'firstName',
      last_name: 'lastName',
      membership_end: 'membershipEnd',
    };
    const sortField = sortFieldMap[query.sortBy] || 'createdAt';

    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          tier: true,
          status: true,
          membershipEnd: true,
          createdAt: true,
        },
        orderBy: { [sortField]: query.sortOrder },
        skip,
        take,
      }),
      prisma.member.count({ where }),
    ]);

    const formattedData = members.map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      tier: m.tier,
      status: m.status,
      membershipEnd: formatDateOnly(m.membershipEnd),
      createdAt: m.createdAt.toISOString(),
    }));

    return {
      data: formattedData,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 0,
      },
    };
  }

  /**
   * ME-02: Register a new member (staff-side creation).
   */
  async createMember(input: CreateMemberInput) {
    // 1. Validate Junior age rule
    if (input.tier === MembershipTier.Junior) {
      if (!input.dateOfBirth) {
        throw new UnprocessableError(
          'VALIDATION_ERROR',
          'dateOfBirth is required for Junior tier membership.'
        );
      }
      const dob = new Date(input.dateOfBirth);
      if (!isUnder18(dob)) {
        throw new UnprocessableError(
          'JUNIOR_AGE_VIOLATION',
          'Junior tier members must be under 18 years of age.'
        );
      }
    }

    // 2. Lookup and validate plan (with robust fallback to active tier plan)
    let plan = input.planId
      ? await prisma.membershipPlan.findUnique({
          where: { id: input.planId },
        })
      : null;

    if (!plan || !plan.isActive) {
      plan = await prisma.membershipPlan.findFirst({
        where: { tier: input.tier, isActive: true },
        orderBy: { durationMonths: 'asc' },
      });
    }

    if (!plan || !plan.isActive) {
      throw new NotFoundError(
        'PLAN_NOT_FOUND',
        `Membership plan for tier '${input.tier}' does not exist or is inactive.`
      );
    }
    if (plan.tier !== input.tier) {
      throw new UnprocessableError(
        'PLAN_TIER_MISMATCH',
        `Selected plan tier '${plan.tier}' does not match member tier '${input.tier}'.`
      );
    }

    // 3. Hash password with bcrypt cost factor 12
    const passwordHash = await bcrypt.hash(input.password, 12);

    // 4. Calculate membership dates
    const membershipStart = new Date();
    const membershipEnd = addMonths(membershipStart, plan.durationMonths);

    // 5. Execute in atomic transaction
    return await prisma.$transaction(async (tx) => {
      // Check email uniqueness across both members and staff
      const [existingMember, existingStaff] = await Promise.all([
        tx.member.findUnique({ where: { email: input.email } }),
        tx.staff.findUnique({ where: { email: input.email } }),
      ]);
      if (existingMember || existingStaff) {
        throw new ConflictError(
          'DUPLICATE_EMAIL',
          `Email '${input.email}' is already registered.`
        );
      }

      // Create Member
      const member = await tx.member.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          passwordHash,
          phone: input.phone ?? null,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          tier: input.tier,
          planId: plan.id,
          membershipStart,
          membershipEnd,
          status: MembershipStatus.active,
          photoUrl: input.photoUrl ?? null,
        },
      });

      // Optional address creation
      let createdAddress = null;
      if (input.address) {
        createdAddress = await tx.memberAddress.create({
          data: {
            memberId: member.id,
            addrLine1: input.address.addrLine1,
            addrLine2: input.address.addrLine2 ?? null,
            city: input.address.city ?? null,
            state: input.address.state ?? null,
            pincode: input.address.pincode,
          },
        });
      }

      // Create initial subscription payment record
      await tx.payment.create({
        data: {
          memberId: member.id,
          amount: plan.price,
          paymentMethod: PaymentMethod.plan,
          notes: `Initial plan subscription: ${plan.tier} (${plan.durationMonths} months)`,
        },
      });

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        dateOfBirth: member.dateOfBirth ? formatDateOnly(member.dateOfBirth) : null,
        tier: member.tier,
        membershipStart: formatDateOnly(member.membershipStart),
        membershipEnd: formatDateOnly(member.membershipEnd),
        status: member.status,
        address: createdAddress
          ? {
              addrLine1: createdAddress.addrLine1,
              addrLine2: createdAddress.addrLine2,
              city: createdAddress.city,
              state: createdAddress.state,
              pincode: createdAddress.pincode,
            }
          : undefined,
        createdAt: member.createdAt.toISOString(),
      };
    });
  }

  /**
   * ME-03: Get full member profile with relationship summary metrics.
   */
  async getMemberById(id: number) {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        addresses: true,
        plan: true,
      },
    });

    if (!member) {
      throw new NotFoundError('MEMBER_NOT_FOUND', `Member with ID ${id} not found.`);
    }

    const [totalBookings, totalOrders, paymentAggregate] = await Promise.all([
      prisma.booking.count({ where: { memberId: id } }),
      prisma.order.count({ where: { memberId: id } }),
      prisma.payment.aggregate({
        where: { memberId: id },
        _sum: { amount: true },
      }),
    ]);

    const totalSpentPaise = Math.round(Number(paymentAggregate._sum.amount || 0) * 100);
    const primaryAddress = member.addresses[0] || null;

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth ? formatDateOnly(member.dateOfBirth) : null,
      tier: member.tier,
      planId: member.planId,
      plan: member.plan,
      membershipStart: formatDateOnly(member.membershipStart),
      membershipEnd: formatDateOnly(member.membershipEnd),
      status: member.status,
      photoUrl: member.photoUrl,
      address: primaryAddress
        ? {
            addrLine1: primaryAddress.addrLine1,
            addrLine2: primaryAddress.addrLine2,
            city: primaryAddress.city,
            state: primaryAddress.state,
            pincode: primaryAddress.pincode,
          }
        : null,
      summary: {
        totalBookings,
        totalOrders,
        totalSpentPaise,
      },
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
    };
  }

  /**
   * ME-04: Full update of member details with role enforcement.
   */
  async updateMember(id: number, input: UpdateMemberInput, isSelf: boolean) {
    // 1. Restrict self-edit: members can ONLY modify phone, dateOfBirth, photoUrl
    if (isSelf) {
      if (
        input.tier !== undefined ||
        input.email !== undefined ||
        input.firstName !== undefined ||
        input.lastName !== undefined
      ) {
        throw new ForbiddenError(
          'Members are only permitted to update phone, dateOfBirth, and photoUrl.',
          'FORBIDDEN'
        );
      }
    }

    const existing = await prisma.member.findUnique({
      where: { id },
      include: { addresses: true },
    });
    if (!existing) {
      throw new NotFoundError('MEMBER_NOT_FOUND', `Member with ID ${id} not found.`);
    }

    // 2. Validate email uniqueness if changed
    if (input.email && input.email !== existing.email) {
      const [memberWithEmail, staffWithEmail] = await Promise.all([
        prisma.member.findUnique({ where: { email: input.email } }),
        prisma.staff.findUnique({ where: { email: input.email } }),
      ]);
      if (memberWithEmail || staffWithEmail) {
        throw new ConflictError(
          'DUPLICATE_EMAIL',
          `Email '${input.email}' is already registered.`
        );
      }
    }

    // 3. Validate Junior age rule if tier is Junior or DOB changed on Junior tier
    const targetTier = input.tier || existing.tier;
    if (targetTier === MembershipTier.Junior) {
      const dobStr = input.dateOfBirth
        ? input.dateOfBirth
        : existing.dateOfBirth
        ? formatDateOnly(existing.dateOfBirth)
        : null;
      if (!dobStr || !isUnder18(new Date(dobStr))) {
        throw new UnprocessableError(
          'JUNIOR_AGE_VIOLATION',
          'Junior tier members must be under 18 years of age.'
        );
      }
    }

    // 4. Update member
    const updated = await prisma.member.update({
      where: { id },
      data: {
        ...(input.firstName && { firstName: input.firstName }),
        ...(input.lastName && { lastName: input.lastName }),
        ...(input.email && { email: input.email }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.dateOfBirth !== undefined && {
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        }),
        ...(input.tier && { tier: input.tier }),
        ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl }),
      },
      include: { addresses: true },
    });

    const primaryAddress = updated.addresses[0] || null;

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      dateOfBirth: updated.dateOfBirth ? formatDateOnly(updated.dateOfBirth) : null,
      tier: updated.tier,
      membershipStart: formatDateOnly(updated.membershipStart),
      membershipEnd: formatDateOnly(updated.membershipEnd),
      status: updated.status,
      photoUrl: updated.photoUrl,
      address: primaryAddress
        ? {
            addrLine1: primaryAddress.addrLine1,
            addrLine2: primaryAddress.addrLine2,
            city: primaryAddress.city,
            state: primaryAddress.state,
            pincode: primaryAddress.pincode,
          }
        : null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * ME-05: Extend a member's membership period (renew).
   */
  async renewMembership(id: number, input: RenewMemberInput) {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundError('MEMBER_NOT_FOUND', `Member with ID ${id} not found.`);
    }

    // Idempotency: check duplicate reference number
    if (input.referenceNo) {
      const existingPayment = await prisma.payment.findFirst({
        where: { referenceNo: input.referenceNo },
      });
      if (existingPayment) {
        throw new ConflictError(
          'DUPLICATE_REFERENCE',
          `Payment reference '${input.referenceNo}' has already been processed.`
        );
      }
    }

    // New membership_end = MAX(membership_end, CURRENT_DATE) + durationMonths
    const now = new Date();
    const baseDate = member.membershipEnd > now ? new Date(member.membershipEnd) : now;
    const newEnd = addMonths(baseDate, input.durationMonths);

    return await prisma.$transaction(async (tx) => {
      // Update member end date and reactivate status
      const updatedMember = await tx.member.update({
        where: { id },
        data: {
          membershipEnd: newEnd,
          status: MembershipStatus.active,
        },
      });

      // Record payment
      const payment = await tx.payment.create({
        data: {
          memberId: id,
          amount: new Prisma.Decimal(input.amountPaise / 100),
          paymentMethod: input.paymentMethod,
          referenceNo: input.referenceNo ?? null,
          notes: `Membership renewal: ${input.durationMonths} months`,
        },
      });

      return {
        id: updatedMember.id,
        membershipStart: formatDateOnly(updatedMember.membershipStart),
        membershipEnd: formatDateOnly(updatedMember.membershipEnd),
        status: updatedMember.status,
        payment: {
          id: payment.id,
          amountPaise: input.amountPaise,
          paymentMethod: payment.paymentMethod,
          paidAt: payment.paidAt.toISOString(),
        },
      };
    });
  }

  /**
   * ME-06: Aggregated activity history (bookings, orders, bar tabs, total spend).
   */
  async getMemberHistory(id: number, query: MemberHistoryQuery) {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundError('MEMBER_NOT_FOUND', `Member with ID ${id} not found.`);
    }

    // Compute date boundaries
    const fromDate = query.from
      ? new Date(`${query.from}T00:00:00.000Z`)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = query.to
      ? new Date(`${query.to}T23:59:59.999Z`)
      : new Date();

    const [bookings, orders, barTabs, paymentAggregate] = await Promise.all([
      prisma.booking.findMany({
        where: {
          memberId: id,
          slotStart: { gte: fromDate, lte: toDate },
        },
        include: { court: true },
        orderBy: { slotStart: 'desc' },
      }),
      prisma.order.findMany({
        where: {
          memberId: id,
          createdAt: { gte: fromDate, lte: toDate },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.barTab.findMany({
        where: {
          memberId: id,
          status: 'settled',
          settledAt: { gte: fromDate, lte: toDate },
        },
        include: { table: true, items: true },
        orderBy: { settledAt: 'desc' },
      }),
      prisma.payment.aggregate({
        where: {
          memberId: id,
          paidAt: { gte: fromDate, lte: toDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const formattedBookings = bookings.map((b) => ({
      id: b.id,
      courtName: b.court.name,
      sport: b.court.sport,
      slotStart: b.slotStart.toISOString(),
      slotEnd: b.slotEnd.toISOString(),
      status: b.status,
      amountPaidPaise: Math.round(Number(b.amountPaid) * 100),
    }));

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      orderType: o.orderType,
      totalAmountPaise: Math.round(Number(o.totalAmount) * 100),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));

    const formattedBarTabs = barTabs.map((t) => {
      const tabTotal = t.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
      return {
        id: t.id,
        tableNo: t.table.tableNo,
        status: t.status,
        totalPaise: Math.round(tabTotal * 100),
        settledAt: t.settledAt ? t.settledAt.toISOString() : null,
      };
    });

    const totalSpentPaise = Math.round(Number(paymentAggregate._sum.amount || 0) * 100);

    return {
      bookings: formattedBookings,
      orders: formattedOrders,
      barTabs: formattedBarTabs,
      totalSpentPaise,
    };
  }

  /**
   * ME-07: Change or subscribe member to a plan.
   * Updates member's planId, tier, and extends membership period.
   */
  async changePlan(id: number, planId: number) {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundError('MEMBER_NOT_FOUND', `Member with ID ${id} not found.`);
    }

    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundError('PLAN_NOT_FOUND', `Membership plan with ID ${planId} not found or inactive.`);
    }

    // New membership_end = MAX(membership_end, CURRENT_DATE) + durationMonths
    const now = new Date();
    const baseDate = member.membershipEnd > now ? new Date(member.membershipEnd) : now;
    const newEnd = addMonths(baseDate, plan.durationMonths);

    return await prisma.$transaction(async (tx) => {
      const updatedMember = await tx.member.update({
        where: { id },
        data: {
          planId: plan.id,
          tier: plan.tier,
          membershipEnd: newEnd,
          status: MembershipStatus.active,
        },
        include: {
          plan: true,
        },
      });

      // Record payment for membership plan
      const payment = await tx.payment.create({
        data: {
          memberId: id,
          amount: plan.price,
          paymentMethod: PaymentMethod.plan,
          notes: `Plan selected: ${plan.tier} (${plan.durationMonths} months)`,
        },
      });

      return {
        id: updatedMember.id,
        tier: updatedMember.tier,
        planId: updatedMember.planId,
        plan: updatedMember.plan,
        membershipStart: formatDateOnly(updatedMember.membershipStart),
        membershipEnd: formatDateOnly(updatedMember.membershipEnd),
        status: updatedMember.status,
        paymentId: payment.id,
      };
    });
  }
}

export const membersService = new MembersService();
