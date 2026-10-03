import { Prisma, MembershipPlan, MembershipTier } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreatePlanInput, UpdatePlanInput } from './plans.validator';

export interface PlanResponse {
  id: number;
  tier: MembershipTier;
  durationMonths: number;
  pricePaise: number;
  courtRatePaise: number;
  shopDiscountPct: number;
  barDiscountPct: number;
  isActive: boolean;
}

/**
 * Transforms a Prisma MembershipPlan entity into the API Contract representation.
 * Converts DB Decimal values (Rupees) into integer Paise without altering DB schema definitions.
 */
export const formatPlan = (plan: MembershipPlan): PlanResponse => ({
  id: plan.id,
  tier: plan.tier,
  durationMonths: plan.durationMonths,
  pricePaise: Math.round(Number(plan.price) * 100),
  courtRatePaise: Math.round(Number(plan.courtRate) * 100),
  shopDiscountPct: plan.shopDiscountPct,
  barDiscountPct: plan.barDiscountPct,
  isActive: plan.isActive,
});

export class PlansService {
  /**
   * MP-01: List all membership plans for admin review (including inactive).
   */
  async getAllPlans(): Promise<PlanResponse[]> {
    const plans = await prisma.membershipPlan.findMany({
      orderBy: [{ tier: 'asc' }, { durationMonths: 'asc' }],
    });
    return plans.map(formatPlan);
  }

  /**
   * Helper to retrieve a single plan by ID.
   * Throws 404 PLAN_NOT_FOUND if absent.
   */
  async getPlanById(id: number): Promise<PlanResponse> {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundError('PLAN_NOT_FOUND', `Membership plan with ID ${id} not found.`);
    }
    return formatPlan(plan);
  }

  /**
   * MP-02: Create a new membership plan with unique [tier, durationMonths] constraint.
   */
  async createPlan(input: CreatePlanInput): Promise<PlanResponse> {
    const existing = await prisma.membershipPlan.findUnique({
      where: {
        tier_durationMonths: {
          tier: input.tier,
          durationMonths: input.durationMonths,
        },
      },
    });

    if (existing) {
      throw new ConflictError(
        'DUPLICATE_PLAN',
        `A membership plan for ${input.tier} tier with duration of ${input.durationMonths} months already exists.`
      );
    }

    const created = await prisma.membershipPlan.create({
      data: {
        tier: input.tier,
        durationMonths: input.durationMonths,
        price: new Prisma.Decimal(input.pricePaise / 100),
        courtRate: new Prisma.Decimal(input.courtRatePaise / 100),
        shopDiscountPct: input.shopDiscountPct,
        barDiscountPct: input.barDiscountPct,
        isActive: true,
      },
    });

    return formatPlan(created);
  }

  /**
   * MP-03: Update an existing membership plan.
   * Note: tier and durationMonths are immutable.
   */
  async updatePlan(id: number, input: UpdatePlanInput): Promise<PlanResponse> {
    const existing = await prisma.membershipPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('PLAN_NOT_FOUND', `Membership plan with ID ${id} not found.`);
    }

    const updateData: Prisma.MembershipPlanUpdateInput = {};
    if (input.pricePaise !== undefined) {
      updateData.price = new Prisma.Decimal(input.pricePaise / 100);
    }
    if (input.courtRatePaise !== undefined) {
      updateData.courtRate = new Prisma.Decimal(input.courtRatePaise / 100);
    }
    if (input.shopDiscountPct !== undefined) {
      updateData.shopDiscountPct = input.shopDiscountPct;
    }
    if (input.barDiscountPct !== undefined) {
      updateData.barDiscountPct = input.barDiscountPct;
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    const updated = await prisma.membershipPlan.update({
      where: { id },
      data: updateData,
    });

    return formatPlan(updated);
  }
}

export const plansService = new PlansService();
