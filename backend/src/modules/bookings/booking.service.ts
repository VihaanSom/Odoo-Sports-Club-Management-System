import { prisma } from '../../config/prisma';
import { NotFoundError, ForbiddenError, AppError, ConflictError, UnprocessableError } from '../../utils/errors';
import { AuthUser } from '../../types';
import { broadcast } from '../../ws';
import {
  ListBookingsQuery,
  CreateBookingInput,
  CancelBookingInput,
  CreateSocialBookingInput,
} from './booking.schema';

export interface FormattedParticipant {
  id?: number;
  memberId?: number | null;
  memberName?: string | null;
  guestName?: string | null;
}

export interface FormattedBooking {
  id: number;
  courtId: number;
  courtName?: string;
  memberId?: number | null;
  memberName?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  slotStart: string;
  slotEnd: string;
  bookingType: string;
  status: string;
  amountPaidPaise: number;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  participantCount?: number;
  participants?: FormattedParticipant[];
}

export class BookingService {
  private idempotencyStore = new Map<string, { timestamp: number; response: FormattedBooking }>();

  private formatBooking(b: any): FormattedBooking {
    const memberName = b.member
      ? `${b.member.firstName} ${b.member.lastName}`.trim()
      : null;

    const formatted: FormattedBooking = {
      id: b.id,
      courtId: b.courtId,
      courtName: b.court?.name ?? undefined,
      memberId: b.memberId ?? null,
      memberName,
      guestName: b.guestName ?? null,
      guestPhone: b.guestPhone ?? null,
      slotStart: b.slotStart instanceof Date ? b.slotStart.toISOString() : new Date(b.slotStart).toISOString(),
      slotEnd: b.slotEnd instanceof Date ? b.slotEnd.toISOString() : new Date(b.slotEnd).toISOString(),
      bookingType: b.bookingType,
      status: b.status,
      amountPaidPaise: Math.round(Number(b.amountPaid || 0) * 100),
      paymentMethod: b.paymentMethod ?? null,
      notes: b.notes ?? null,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : new Date(b.createdAt).toISOString(),
    };

    if (b.participants && Array.isArray(b.participants)) {
      formatted.participantCount = b.participants.length;
      formatted.participants = b.participants.map((p: any) => ({
        id: p.id,
        memberId: p.memberId ?? null,
        memberName: p.member
          ? `${p.member.firstName} ${p.member.lastName}`.trim()
          : null,
        guestName: p.guestName ?? null,
      }));
    }

    return formatted;
  }

  /**
   * BK-01: List bookings with filters & pagination
   */
  async listBookings(user: AuthUser, query: ListBookingsQuery) {
    const { page, pageSize, date, courtId, memberId, status, bookingType, sortBy, sortOrder } = query;

    const where: any = {};

    // Member can only see their own bookings
    if (user.role === 'member') {
      const userMemberId = user.sub ?? user.id;
      where.OR = [
        { memberId: userMemberId },
        { participants: { some: { memberId: userMemberId } } },
      ];
    } else if (memberId) {
      where.memberId = memberId;
    }

    if (courtId) {
      where.courtId = courtId;
    }

    if (status) {
      where.status = status;
    }

    if (bookingType) {
      where.bookingType = bookingType;
    }

    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const dayEnd = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
      where.slotStart = { gte: dayStart, lt: dayEnd };
    }

    const sortField = sortBy === 'created_at' ? 'createdAt' : 'slotStart';

    const [total, rawBookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          court: { select: { id: true, name: true } },
          member: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortField]: sortOrder },
      }),
    ]);

    const data = rawBookings.map((b) => this.formatBooking(b));

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * BK-02: Create member or walk-in booking
   */
  async createBooking(user: AuthUser, input: CreateBookingInput, idempotencyKey?: string) {
    // Idempotency check (24h retention)
    if (idempotencyKey) {
      const existing = this.idempotencyStore.get(idempotencyKey);
      if (existing) {
        if (Date.now() - existing.timestamp < 24 * 60 * 60 * 1000) {
          return existing.response;
        } else {
          this.idempotencyStore.delete(idempotencyKey);
        }
      }
    }

    const userMemberId = user.sub ?? user.id;

    // Role checks
    if (user.role === 'member') {
      if (input.bookingType !== 'member') {
        throw new ForbiddenError('Members cannot create walk-in bookings', 'FORBIDDEN');
      }
      if (input.memberId && input.memberId !== userMemberId) {
        throw new ForbiddenError('Member can only book for themselves', 'FORBIDDEN');
      }
      input.memberId = userMemberId;
    }

    // 1. Validate Court
    const court = await prisma.court.findUnique({
      where: { id: input.courtId },
    });

    if (!court || !court.isActive) {
      throw new NotFoundError(`Court with ID ${input.courtId} not found or is inactive`, 'COURT_NOT_FOUND');
    }

    const slotStart = new Date(input.slotStart);
    const slotEnd = new Date(input.slotEnd);

    // 2. Validate Member & Daily Limit if member booking
    let amountPaise = 0;

    if (input.bookingType === 'member') {
      const targetMemberId = input.memberId!;
      const member = await prisma.member.findUnique({
        where: { id: targetMemberId },
      });

      if (!member) {
        throw new NotFoundError(`Member with ID ${targetMemberId} not found`, 'MEMBER_NOT_FOUND');
      }

      if (member.status === 'expired') {
        throw new AppError('Member membership has expired', 422, 'MEMBERSHIP_EXPIRED');
      }

      // Daily limit: max 2 confirmed bookings per member per UTC day
      const dayStart = new Date(Date.UTC(slotStart.getUTCFullYear(), slotStart.getUTCMonth(), slotStart.getUTCDate(), 0, 0, 0));
      const dayEnd = new Date(Date.UTC(slotStart.getUTCFullYear(), slotStart.getUTCMonth(), slotStart.getUTCDate() + 1, 0, 0, 0));

      const dailyBookingsCount = await prisma.booking.count({
        where: {
          memberId: targetMemberId,
          status: 'confirmed',
          slotStart: { gte: dayStart, lt: dayEnd },
        },
      });

      if (dailyBookingsCount >= 2) {
        throw new AppError('Daily booking limit exceeded (maximum 2 bookings per day)', 422, 'DAILY_LIMIT_EXCEEDED');
      }

      // Pricing by tier
      if (member.tier === 'Gold') {
        amountPaise = 0;
      } else if (member.tier === 'Silver') {
        amountPaise = 20000; // ₹200
      } else if (member.tier === 'Junior') {
        amountPaise = 10000; // ₹100
      }
    } else {
      // Walk-in booking pricing
      amountPaise = 50000; // ₹500
    }

    // 3. Check for slot conflict (overlapping confirmed booking on this court)
    const conflict = await prisma.booking.findFirst({
      where: {
        courtId: input.courtId,
        status: 'confirmed',
        slotStart: { lt: slotEnd },
        slotEnd: { gt: slotStart },
      },
    });

    if (conflict) {
      throw new AppError('Court is already booked for this time slot', 409, 'SLOT_CONFLICT');
    }

    // 4. ACID Transaction to create Booking + Payment
    const amountDecimal = amountPaise / 100;

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          courtId: input.courtId,
          memberId: input.bookingType === 'member' ? input.memberId : null,
          guestName: input.bookingType === 'walk_in' ? input.guestName : null,
          guestPhone: input.bookingType === 'walk_in' ? input.guestPhone : null,
          bookingType: input.bookingType,
          slotStart,
          slotEnd,
          status: 'confirmed',
          amountPaid: amountDecimal,
          paymentMethod: input.paymentMethod,
          notes: input.notes ?? null,
        },
        include: {
          court: { select: { id: true, name: true } },
          member: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      await tx.payment.create({
        data: {
          memberId: input.bookingType === 'member' ? input.memberId : null,
          bookingId: booking.id,
          amount: amountDecimal,
          paymentMethod: input.paymentMethod,
          notes: input.bookingType === 'walk_in' ? 'Walk-in court booking' : 'Member court booking',
        },
      });

      return booking;
    });

    const formatted = this.formatBooking(result);

    // Save in idempotency store if key was provided
    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, {
        timestamp: Date.now(),
        response: formatted,
      });
    }

    // WebSocket side effect
    broadcast('court:availability', {
      event: 'booking:created',
      data: {
        courtId: formatted.courtId,
        slotStart: formatted.slotStart,
        slotEnd: formatted.slotEnd,
        status: 'booked',
        bookingType: formatted.bookingType,
      },
    });

    return formatted;
  }

  /**
   * BK-03: Get booking detail by ID
   */
  async getBookingById(user: AuthUser, id: number) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        court: { select: { id: true, name: true } },
        member: { select: { id: true, firstName: true, lastName: true } },
        participants: {
          include: {
            member: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundError(`Booking with ID ${id} not found`, 'BOOKING_NOT_FOUND');
    }

    if (user.role === 'member') {
      const userMemberId = user.sub ?? user.id;
      const isOwner =
        booking.memberId === userMemberId ||
        booking.participants.some((p) => p.memberId === userMemberId);

      if (!isOwner) {
        throw new ForbiddenError('Access denied to this booking', 'FORBIDDEN');
      }
    }

    return this.formatBooking(booking);
  }

  /**
   * BK-04: Cancel confirmed booking
   */
  async cancelBooking(user: AuthUser, id: number, input: CancelBookingInput) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        court: { select: { id: true, name: true } },
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!booking) {
      throw new NotFoundError(`Booking with ID ${id} not found`, 'BOOKING_NOT_FOUND');
    }

    if (user.role === 'member') {
      const userMemberId = user.sub ?? user.id;
      if (booking.memberId !== userMemberId) {
        throw new ForbiddenError("Cannot cancel another member's booking", 'FORBIDDEN');
      }
    }

    if (booking.status === 'cancelled') {
      throw new AppError('Booking is already cancelled', 422, 'INVALID_STATE_TRANSITION');
    }

    const cancellationNote = input.reason
      ? booking.notes
        ? `${booking.notes} | Cancellation reason: ${input.reason}`
        : `Cancellation reason: ${input.reason}`
      : booking.notes;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: cancellationNote,
      },
      include: {
        court: { select: { id: true, name: true } },
        member: { select: { id: true, firstName: true, lastName: true } },
        participants: {
          include: {
            member: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    const formatted = this.formatBooking(updated);

    // WebSocket side effect
    broadcast('court:availability', {
      event: 'booking:cancelled',
      data: {
        courtId: formatted.courtId,
        slotStart: formatted.slotStart,
        slotEnd: formatted.slotEnd,
        status: 'free',
      },
    });

    return formatted;
  }

  /**
   * BK-05: Create social play booking
   */
  async createSocialBooking(input: CreateSocialBookingInput) {
    const court = await prisma.court.findUnique({
      where: { id: input.courtId },
    });

    if (!court || !court.isActive) {
      throw new NotFoundError(`Court with ID ${input.courtId} not found or is inactive`, 'COURT_NOT_FOUND');
    }

    const slotStart = new Date(input.slotStart);
    const slotEnd = new Date(input.slotEnd);

    // Validate all member participants
    const dayStart = new Date(Date.UTC(slotStart.getUTCFullYear(), slotStart.getUTCMonth(), slotStart.getUTCDate(), 0, 0, 0));
    const dayEnd = new Date(Date.UTC(slotStart.getUTCFullYear(), slotStart.getUTCMonth(), slotStart.getUTCDate() + 1, 0, 0, 0));

    for (const p of input.participants) {
      if (p.memberId) {
        const member = await prisma.member.findUnique({
          where: { id: p.memberId },
        });

        if (!member) {
          throw new NotFoundError(`Member with ID ${p.memberId} not found`, 'MEMBER_NOT_FOUND');
        }

        if (member.status === 'expired') {
          throw new AppError(`Member ${member.firstName} ${member.lastName} has an expired membership`, 422, 'MEMBERSHIP_EXPIRED');
        }

        const memberDailyCount = await prisma.booking.count({
          where: {
            OR: [
              { memberId: p.memberId },
              { participants: { some: { memberId: p.memberId } } },
            ],
            status: 'confirmed',
            slotStart: { gte: dayStart, lt: dayEnd },
          },
        });

        if (memberDailyCount >= 2) {
          throw new AppError(
            `Daily booking limit exceeded for member ${member.firstName} ${member.lastName}`,
            422,
            'DAILY_LIMIT_EXCEEDED'
          );
        }
      }
    }

    // Overlap conflict check
    const conflict = await prisma.booking.findFirst({
      where: {
        courtId: input.courtId,
        status: 'confirmed',
        slotStart: { lt: slotEnd },
        slotEnd: { gt: slotStart },
      },
    });

    if (conflict) {
      throw new AppError('Court is already booked for this time slot', 409, 'SLOT_CONFLICT');
    }

    // Flat rate ₹150 (15000 paise) per person
    const amountPaise = input.participants.length * 15000;
    const amountDecimal = amountPaise / 100;

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          courtId: input.courtId,
          bookingType: 'social',
          slotStart,
          slotEnd,
          status: 'confirmed',
          amountPaid: amountDecimal,
          paymentMethod: input.paymentMethod,
          notes: input.notes ?? null,
        },
      });

      await tx.bookingParticipant.createMany({
        data: input.participants.map((p) => ({
          bookingId: booking.id,
          memberId: p.memberId ?? null,
          guestName: p.guestName ?? null,
        })),
      });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: amountDecimal,
          paymentMethod: input.paymentMethod,
          notes: 'Social play booking',
        },
      });

      return tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          court: { select: { id: true, name: true } },
          participants: {
            include: {
              member: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });
    });

    const formatted = this.formatBooking(result);

    // WebSocket side effect
    broadcast('court:availability', {
      event: 'booking:created',
      data: {
        courtId: formatted.courtId,
        slotStart: formatted.slotStart,
        slotEnd: formatted.slotEnd,
        status: 'booked',
        bookingType: formatted.bookingType,
      },
    });

    return formatted;
  }

  /**
   * BK-06: Today's bookings grouped by court
   */
  async getTodayBookings(dateStr?: string) {
    let targetDate = dateStr;
    if (!targetDate) {
      const now = new Date();
      targetDate = now.toISOString().split('T')[0];
    }

    const [year, month, day] = targetDate.split('-').map(Number);
    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));

    const courts = await prisma.court.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        courtId: { in: courts.map((c) => c.id) },
        status: 'confirmed',
        slotStart: { gte: dayStart, lt: dayEnd },
      },
      include: {
        member: { select: { firstName: true, lastName: true } },
      },
      orderBy: { slotStart: 'asc' },
    });

    const bookingsByCourt = new Map<number, any[]>();
    for (const b of bookings) {
      const list = bookingsByCourt.get(b.courtId) || [];
      list.push(b);
      bookingsByCourt.set(b.courtId, list);
    }

    const courtSummaries = courts.map((court) => {
      const courtBookings = bookingsByCourt.get(court.id) || [];
      return {
        courtId: court.id,
        courtName: court.name,
        sport: court.sport,
        bookings: courtBookings.map((b) => ({
          id: b.id,
          slotStart: b.slotStart.toISOString(),
          slotEnd: b.slotEnd.toISOString(),
          bookingType: b.bookingType,
          status: b.status,
          memberName: b.member ? `${b.member.firstName} ${b.member.lastName}`.trim() : (b.guestName ?? null),
        })),
      };
    });

    return {
      date: targetDate,
      courts: courtSummaries,
    };
  }
}

export const bookingService = new BookingService();
