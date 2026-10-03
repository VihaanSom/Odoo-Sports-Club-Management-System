import { Router } from 'express';
import { staffController } from './staff.controller';
import { verifyToken, requireRole, requireStaff } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createLeaveSchema,
  listLeaveQuerySchema,
  reviewLeaveSchema,
  leaveIdParamSchema,
} from './staff.validator';

const router = Router();

// ==========================================
// LEAVE REQUESTS (LV-01, LV-03)
// ==========================================

/**
 * LV-01: Submit leave request
 * POST /api/v1/leave
 * Auth: All staff roles (admin, front_desk, bar, shop)
 */
router.post(
  '/',
  verifyToken,
  requireStaff,
  validate(createLeaveSchema, 'body'),
  (req, res) => staffController.createLeave(req, res)
);

/**
 * List all leave requests across the club
 * GET /api/v1/leave
 * Auth: admin
 */
router.get(
  '/',
  verifyToken,
  requireRole('admin'),
  validate(listLeaveQuerySchema, 'query'),
  (req, res) => staffController.listAllLeaves(req, res)
);

/**
 * LV-03: Approve or reject leave request
 * PUT /api/v1/leave/:id
 * Auth: admin
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validate(leaveIdParamSchema, 'params'),
  validate(reviewLeaveSchema, 'body'),
  (req, res) => staffController.reviewLeave(req, res)
);

export default router;
