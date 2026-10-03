import { prisma } from '../../config/prisma';
import { MembershipTier } from '@prisma/client';

export class NotFoundError extends Error {
  public statusCode = 404;
  public code: string;

  constructor(code = 'NOT_FOUND', message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.code = code;
  }
}

export class InvoicesService {
  /**
   * IN-01: List members due for renewal (membership_end within 30 days)
   */
  async getMembersDueForRenewal() {
    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setUTCDate(now.getUTCDate() + 30);

    // Also include recently expired (within last 30 days) for renewal invoices
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(now.getUTCDate() - 30);

    const members = await prisma.member.findMany({
      where: {
        membershipEnd: {
          gte: thirtyDaysAgo,
          lte: thirtyDaysAhead,
        },
      },
      orderBy: {
        membershipEnd: 'asc',
      },
    });

    return members.map((m) => {
      const end = new Date(m.membershipEnd);
      const diffMs = end.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return {
        memberId: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phone,
        tier: m.tier,
        membershipEnd: m.membershipEnd.toISOString().split('T')[0],
        daysRemaining: Math.max(0, daysRemaining),
      };
    });
  }

  /**
   * IN-02: Generate a membership invoice record
   */
  async generateMemberInvoice(memberId: number) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundError('MEMBER_NOT_FOUND', `Member with ID ${memberId} not found.`);
    }

    // Lookup plan price for member's tier
    const plan = await prisma.membershipPlan.findFirst({
      where: {
        tier: member.tier,
        isActive: true,
      },
      orderBy: {
        durationMonths: 'desc',
      },
    });

    let renewalAmountPaise = 5000000; // default 50000 INR (paise)
    if (plan) {
      renewalAmountPaise = Math.round(Number(plan.price) * 100);
    } else {
      if (member.tier === MembershipTier.Gold) renewalAmountPaise = 5000000;
      else if (member.tier === MembershipTier.Silver) renewalAmountPaise = 3000000;
      else if (member.tier === MembershipTier.Junior) renewalAmountPaise = 1500000;
    }

    const currentYear = new Date().getUTCFullYear();
    const invoiceNumber = `INV-${currentYear}-${member.id.toString().padStart(4, '0')}`;

    return {
      invoiceNumber,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`.trim(),
      tier: member.tier,
      currentMembershipEnd: member.membershipEnd.toISOString().split('T')[0],
      renewalAmountPaise,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const invoicesService = new InvoicesService();
