import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authenticate, requireRoles } from '../../middlewares/auth.middleware';
import { validateQuery } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response';
import { PaymentMethod } from '@prisma/client';

const router = Router();

const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  from: z.string().optional(),
  to: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'plan']).optional(),
  memberId: z.coerce.number().int().positive().optional(),
});

/**
 * PM-01: GET /api/v1/payments
 * Unified payment ledger. Read-only.
 * Auth: admin
 */
router.get(
  '/',
  authenticate,
  requireRoles('admin'),
  validateQuery(listPaymentsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as z.infer<typeof listPaymentsQuerySchema>;
      const page = query.page || 1;
      const pageSize = query.pageSize || 20;
      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (query.memberId) {
        where.memberId = query.memberId;
      }

      if (query.paymentMethod) {
        where.paymentMethod = query.paymentMethod as PaymentMethod;
      }

      if (query.from || query.to) {
        where.paidAt = {};
        if (query.from) {
          where.paidAt.gte = new Date(query.from);
        }
        if (query.to) {
          const toDate = new Date(query.to);
          if (query.to.length <= 10) {
            toDate.setUTCHours(23, 59, 59, 999);
          }
          where.paidAt.lte = toDate;
        }
      }

      const [total, payments] = await Promise.all([
        prisma.payment.count({ where }),
        prisma.payment.findMany({
          where,
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { paidAt: 'desc' },
          skip,
          take: pageSize,
        }),
      ]);

      const formatted = payments.map((p) => {
        const memberName = p.member
          ? `${p.member.firstName} ${p.member.lastName}`.trim()
          : null;

        return {
          id: p.id,
          memberId: p.memberId,
          memberName,
          bookingId: p.bookingId,
          orderId: p.orderId,
          barTabId: p.barTabId,
          amountPaise: Math.round(Number(p.amount) * 100),
          paymentMethod: p.paymentMethod,
          referenceNo: p.referenceNo,
          notes: p.notes,
          paidAt: p.paidAt.toISOString(),
        };
      });

      sendSuccess(
        res,
        formatted,
        undefined,
        200,
        {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        }
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
