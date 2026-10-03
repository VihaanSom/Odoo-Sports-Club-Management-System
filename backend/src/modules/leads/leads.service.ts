import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { courtService } from '../courts/court.service';
import { broadcast } from '../../ws';
import { generateAccessToken, generateRefreshToken } from '../../utils/token';
import {
  NotFoundError,
  ConflictError,
  UnprocessableError,
  AppError,
} from '../../utils/errors';
import {
  ListLeadsQuery,
  UpdateLeadInput,
  SubmitLeadInput,
  RequestTrialInput,
  PublicRegisterInput,
  PublicEquipmentQuery,
  PublicSlotsQuery,
} from './leads.schema';

// In-memory sliding-window rate limiter
class SimpleRateLimiter {
  private requests = new Map<string, number[]>();

  isRateLimited(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length >= limit) {
      this.requests.set(key, valid);
      return true;
    }
    valid.push(now);
    this.requests.set(key, valid);
    return false;
  }
}

const rateLimiter = new SimpleRateLimiter();

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

export class LeadsService {
  private formatLead(lead: any) {
    const assignedStaffName = lead.staff
      ? `${lead.staff.firstName} ${lead.staff.lastName}`.trim()
      : null;

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      message: lead.message ?? null,
      status: lead.status,
      assignedTo: lead.assignedTo ?? null,
      assignedStaffName,
      createdAt: lead.createdAt instanceof Date ? lead.createdAt.toISOString() : new Date(lead.createdAt).toISOString(),
      updatedAt: lead.updatedAt instanceof Date ? lead.updatedAt.toISOString() : new Date(lead.updatedAt).toISOString(),
    };
  }

  // ==========================================
  // LD-01: List Leads
  // ==========================================
  async listLeads(query: ListLeadsQuery) {
    const { page, pageSize, status, sortBy, sortOrder } = query;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const sortField = sortBy === 'status' ? 'status' : 'createdAt';

    const [total, rawLeads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        include: {
          staff: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortField]: sortOrder },
      }),
    ]);

    return {
      data: rawLeads.map((l) => this.formatLead(l)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  // ==========================================
  // LD-02: Get Lead Detail
  // ==========================================
  async getLeadById(id: number) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!lead) {
      throw new NotFoundError(`Lead with ID ${id} not found`, 'LEAD_NOT_FOUND');
    }

    return this.formatLead(lead);
  }

  // ==========================================
  // LD-03: Update Lead Status & Assignment
  // ==========================================
  async updateLead(id: number, input: UpdateLeadInput) {
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundError(`Lead with ID ${id} not found`, 'LEAD_NOT_FOUND');
    }

    if (input.assignedTo !== undefined && input.assignedTo !== null) {
      const staff = await prisma.staff.findUnique({
        where: { id: input.assignedTo },
      });
      if (!staff || !staff.isActive) {
        throw new NotFoundError(`Staff with ID ${input.assignedTo} not found or is inactive`, 'STAFF_NOT_FOUND');
      }
    }

    // State machine verification (§9.4)
    // new -> contacted, converted, lost
    // contacted -> converted, lost
    // converted -> terminal (forbidden)
    // lost -> terminal (forbidden)
    if (lead.status === 'converted' && input.status !== 'converted') {
      throw new UnprocessableError(
        "Cannot transition lead from terminal status 'converted'",
        'INVALID_STATE_TRANSITION'
      );
    }

    if (lead.status === 'lost' && input.status !== 'lost') {
      throw new UnprocessableError(
        "Cannot transition lead from terminal status 'lost'",
        'INVALID_STATE_TRANSITION'
      );
    }

    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      new: ['new', 'contacted', 'converted', 'lost'],
      contacted: ['contacted', 'converted', 'lost'],
      converted: ['converted'],
      lost: ['lost'],
    };

    if (!ALLOWED_TRANSITIONS[lead.status]?.includes(input.status)) {
      throw new UnprocessableError(
        `Invalid status transition from '${lead.status}' to '${input.status}'`,
        'INVALID_STATE_TRANSITION'
      );
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: input.status,
        ...(input.assignedTo !== undefined ? { assignedTo: input.assignedTo } : {}),
      },
      include: {
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return this.formatLead(updated);
  }

  // ==========================================
  // PU-01: Public Membership Plans
  // ==========================================
  async getPublicPlans() {
    const rawPlans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: [{ tier: 'asc' }, { durationMonths: 'asc' }],
    });

    const tierOrder: Record<string, number> = { Gold: 1, Silver: 2, Junior: 3 };
    const plansByTier = new Map<string, any[]>();

    for (const plan of rawPlans) {
      const list = plansByTier.get(plan.tier) || [];
      list.push({
        id: plan.id,
        durationMonths: plan.durationMonths,
        pricePaise: Math.round(Number(plan.price) * 100),
        courtRatePaise: Math.round(Number(plan.courtRate) * 100),
        shopDiscountPct: plan.shopDiscountPct,
        barDiscountPct: plan.barDiscountPct,
      });
      plansByTier.set(plan.tier, list);
    }

    const tiers = Array.from(plansByTier.keys()).sort(
      (a, b) => (tierOrder[a] ?? 99) - (tierOrder[b] ?? 99)
    );

    return tiers.map((tier) => ({
      tier,
      plans: plansByTier.get(tier) || [],
    }));
  }

  // ==========================================
  // PU-02: Public Courts List
  // ==========================================
  async getPublicCourts() {
    return prisma.court.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sport: true,
        openTime: true,
        closeTime: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  // ==========================================
  // PU-03: Public Shop Catalogue
  // ==========================================
  async getPublicEquipment(query: PublicEquipmentQuery) {
    const where: any = { isActive: true };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const items = await prisma.equipment.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
        description: true,
        price: true,
        imageUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      brand: item.brand ?? null,
      description: item.description ?? null,
      pricePaise: Math.round(Number(item.price) * 100),
      imageUrl: item.imageUrl ?? null,
    }));
  }

  // ==========================================
  // PU-04: Public Slot Availability
  // ==========================================
  async getPublicSlots(query: PublicSlotsQuery) {
    return courtService.getCourtAvailability(query);
  }

  // ==========================================
  // PU-05: Submit Visitor Enquiry
  // ==========================================
  async submitPublicLead(input: SubmitLeadInput, clientIp: string) {
    // Rate limit: 5 requests per IP per hour
    if (rateLimiter.isRateLimited(`lead_${clientIp}`, 5, 60 * 60 * 1000)) {
      throw new AppError('Too many lead enquiries. Please try again later.', 429, 'RATE_LIMITED');
    }

    const lead = await prisma.lead.create({
      data: {
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        message: input.message ?? null,
        status: 'new',
      },
    });

    // WebSocket broadcast to leads:new
    broadcast('leads:new', {
      event: 'lead:created',
      data: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        createdAt: lead.createdAt.toISOString(),
      },
    });

    return {
      id: lead.id,
      message: 'Thank you for your enquiry. Our team will contact you shortly.',
    };
  }

  // ==========================================
  // PU-06: Request Trial Session
  // ==========================================
  async requestPublicTrial(input: RequestTrialInput) {
    const [year, month, day] = input.preferredDate.split('-').map(Number);
    const [openHour, openMin] = input.preferredTime.split(':').map(Number);

    const slotStart = new Date(Date.UTC(year, month - 1, day, openHour, openMin, 0));
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

    const messageText = `Trial session request: ${input.sport} on ${input.preferredDate} at ${input.preferredTime}`;

    // Find active courts for the requested sport
    const courts = await prisma.court.findMany({
      where: {
        sport: input.sport,
        isActive: true,
      },
      orderBy: { id: 'asc' },
    });

    let selectedCourt: any = null;

    for (const court of courts) {
      // Check operating hours
      const [cOpenH, cOpenM] = court.openTime.split(':').map(Number);
      const [cCloseH, cCloseM] = court.closeTime.split(':').map(Number);
      const courtOpenMins = cOpenH * 60 + cOpenM;
      const courtCloseMins = cCloseH * 60 + cCloseM;
      const slotStartMins = openHour * 60 + openMin;
      const slotEndMins = slotStartMins + 60;

      const isDefaultFullDay = court.openTime === '00:00' && court.closeTime === '23:30';
      if (!isDefaultFullDay && (slotStartMins < courtOpenMins || slotEndMins > courtCloseMins)) {
        continue;
      }

      // Check slot conflict
      const conflict = await prisma.booking.findFirst({
        where: {
          courtId: court.id,
          status: 'confirmed',
          slotStart: { lt: slotEnd },
          slotEnd: { gt: slotStart },
        },
      });

      if (!conflict) {
        selectedCourt = court;
        break;
      }
    }

    if (selectedCourt) {
      // Create lead and trial booking atomically
      const result = await prisma.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone ?? null,
            message: messageText,
            status: 'new',
          },
        });

        const booking = await tx.booking.create({
          data: {
            courtId: selectedCourt.id,
            guestName: input.name,
            guestPhone: input.phone ?? null,
            bookingType: 'walk_in',
            slotStart,
            slotEnd,
            status: 'confirmed',
            amountPaid: 0,
            paymentMethod: 'cash',
            notes: 'Free trial session',
          },
        });

        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: 0,
            paymentMethod: 'cash',
            notes: 'Free trial booking',
          },
        });

        return { lead, booking };
      });

      // WebSocket broadcast
      broadcast('leads:new', {
        event: 'lead:created',
        data: {
          id: result.lead.id,
          name: result.lead.name,
          email: result.lead.email,
          createdAt: result.lead.createdAt.toISOString(),
        },
      });

      broadcast('court:availability', {
        event: 'booking:created',
        data: {
          courtId: selectedCourt.id,
          slotStart: slotStart.toISOString(),
          slotEnd: slotEnd.toISOString(),
          status: 'booked',
          bookingType: 'walk_in',
        },
      });

      return {
        leadId: result.lead.id,
        bookingId: result.booking.id,
        courtName: selectedCourt.name,
        slotStart: slotStart.toISOString(),
        slotEnd: slotEnd.toISOString(),
        message: `Your trial session is booked! See you on ${input.preferredDate}.`,
      };
    } else {
      // Court not available: create lead only
      const lead = await prisma.lead.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          message: `${messageText} (Slot was fully booked)`,
          status: 'new',
        },
      });

      broadcast('leads:new', {
        event: 'lead:created',
        data: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          createdAt: lead.createdAt.toISOString(),
        },
      });

      return {
        leadId: lead.id,
        bookingId: null,
        message: 'That time slot is not available. Our team will contact you with alternatives.',
      };
    }
  }

  // ==========================================
  // PU-07: Member Self-Registration
  // ==========================================
  async registerPublicMember(input: PublicRegisterInput, clientIp: string) {
    // Rate limit: 3 registrations per IP per hour
    if (rateLimiter.isRateLimited(`register_${clientIp}`, 3, 60 * 60 * 1000)) {
      throw new AppError('Too many registration attempts. Please try again later.', 429, 'RATE_LIMITED');
    }

    // 1. Email uniqueness across member and staff tables
    const [existingMember, existingStaff] = await Promise.all([
      prisma.member.findUnique({ where: { email: input.email } }),
      prisma.staff.findUnique({ where: { email: input.email } }),
    ]);

    if (existingMember || existingStaff) {
      throw new ConflictError('Email is already registered in the system', 'DUPLICATE_EMAIL');
    }

    // 2. Plan validation (with fallback to active plan for tier)
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
      throw new NotFoundError(`Membership plan for tier '${input.tier}' not found or inactive`, 'PLAN_NOT_FOUND');
    }

    if (plan.tier !== input.tier) {
      throw new UnprocessableError(
        `Plan tier '${plan.tier}' does not match requested tier '${input.tier}'`,
        'PLAN_TIER_MISMATCH'
      );
    }

    // 3. Junior Age verification
    if (input.tier === 'Junior') {
      if (!input.dateOfBirth) {
        throw new UnprocessableError('Date of birth is required for Junior membership', 'VALIDATION_ERROR');
      }
      const dob = new Date(input.dateOfBirth);
      if (!isUnder18(dob)) {
        throw new UnprocessableError('Junior members must be under 18 years of age', 'JUNIOR_AGE_VIOLATION');
      }
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(input.password, 10);

    // 5. Date calculation
    const membershipStart = new Date();
    const membershipEnd = addMonths(membershipStart, plan.durationMonths);

    // 6. Transaction to create member, address, and payment
    const result = await prisma.$transaction(async (tx) => {
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
          status: 'active',
          photoUrl: input.photoUrl ?? null,
        },
      });

      if (input.address) {
        await tx.memberAddress.create({
          data: {
            memberId: member.id,
            addrLine1: input.address.addrLine1,
            addrLine2: input.address.addrLine2 ?? null,
            city: input.address.city,
            state: input.address.state,
            pincode: input.address.pincode,
          },
        });
      }

      await tx.payment.create({
        data: {
          memberId: member.id,
          amount: plan.price,
          paymentMethod: input.paymentMethod,
          referenceNo: input.referenceNo ?? null,
          notes: `Self-registration on plan: ${plan.tier} (${plan.durationMonths}m)`,
        },
      });

      return member;
    });

    // 7. Auto-login token generation
    const tokenPayload = {
      sub: result.id,
      email: result.email,
      role: 'member' as const,
      tier: result.tier,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      member: {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        tier: result.tier,
        membershipStart: result.membershipStart.toISOString().split('T')[0],
        membershipEnd: result.membershipEnd.toISOString().split('T')[0],
        status: result.status,
        photoUrl: result.photoUrl,
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}

export const leadsService = new LeadsService();
