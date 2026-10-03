import { Router } from 'express';
import { membersController } from './members.controller';
import { addressController } from './address.controller';
import { verifyToken, requireRole, requireSelfOrRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  memberIdParamSchema,
  listMembersQuerySchema,
  createMemberSchema,
  updateMemberSchema,
  renewMemberSchema,
  memberHistoryQuerySchema,
} from './members.validator';
import { addressBodySchema } from './address.validator';

const router = Router();

// ==========================================
// MEMBER CORE ROUTES (ME-01 to ME-06)
// ==========================================

/**
 * ME-01: List members with pagination, search, and filtering
 * GET /api/v1/members
 * Auth: admin, front_desk
 */
router.get(
  '/',
  verifyToken,
  requireRole('admin', 'front_desk'),
  validate(listMembersQuerySchema, 'query'),
  (req, res) => membersController.listMembers(req, res)
);

/**
 * ME-02: Register a new member (staff-side creation)
 * POST /api/v1/members
 * Auth: admin, front_desk
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'front_desk'),
  validate(createMemberSchema, 'body'),
  (req, res) => membersController.createMember(req, res)
);

/**
 * ME-03: Get full member profile with summary metrics
 * GET /api/v1/members/:id
 * Auth: admin, front_desk, or self
 */
router.get(
  '/:id',
  verifyToken,
  requireSelfOrRole('admin', 'front_desk'),
  validate(memberIdParamSchema, 'params'),
  (req, res) => membersController.getMember(req, res)
);

/**
 * ME-04: Update member details
 * PUT /api/v1/members/:id
 * Auth: admin, front_desk, or self (restricted fields for self)
 */
router.put(
  '/:id',
  verifyToken,
  requireSelfOrRole('admin', 'front_desk'),
  validate(memberIdParamSchema, 'params'),
  validate(updateMemberSchema, 'body'),
  (req, res) => membersController.updateMember(req, res)
);

/**
 * ME-05: Extend member's membership (renew)
 * POST /api/v1/members/:id/renew
 * Auth: admin, front_desk
 */
router.post(
  '/:id/renew',
  verifyToken,
  requireRole('admin', 'front_desk'),
  validate(memberIdParamSchema, 'params'),
  validate(renewMemberSchema, 'body'),
  (req, res) => membersController.renewMembership(req, res)
);

/**
 * ME-07: Change or select membership plan
 * POST /api/v1/members/:id/plan
 * Auth: admin, front_desk, or self
 */
router.post(
  '/:id/plan',
  verifyToken,
  requireSelfOrRole('admin', 'front_desk'),
  validate(memberIdParamSchema, 'params'),
  (req, res) => membersController.changePlan(req, res)
);

/**
 * ME-06: Member activity history
 * GET /api/v1/members/:id/history
 * Auth: admin, front_desk, or self
 */
router.get(
  '/:id/history',
  verifyToken,
  requireSelfOrRole('admin', 'front_desk'),
  validate(memberIdParamSchema, 'params'),
  validate(memberHistoryQuerySchema, 'query'),
  (req, res) => membersController.getMemberHistory(req, res)
);

// ==========================================
// MEMBER ADDRESS ROUTES (MA-01 to MA-03)
// ==========================================

/**
 * MA-01: Get member's address
 * GET /api/v1/members/:id/address
 * Auth: admin, front_desk, or self
 */
router.get(
  '/:id/address',
  verifyToken,
  requireSelfOrRole('admin', 'front_desk'),
  validate(memberIdParamSchema, 'params'),
  (req, res) => addressController.getAddress(req, res)
);

/**
 * MA-02: Create/update member address (upsert)
 * PUT /api/v1/members/:id/address
 * Auth: admin, front_desk, or self
 */
router.put(
  '/:id/address',
  verifyToken,
  requireSelfOrRole('admin', 'front_desk'),
  validate(memberIdParamSchema, 'params'),
  validate(addressBodySchema, 'body'),
  (req, res) => addressController.upsertAddress(req, res)
);

/**
 * MA-03: Delete member address
 * DELETE /api/v1/members/:id/address
 * Auth: admin, front_desk, or self
 */
router.delete(
  '/:id/address',
  verifyToken,
  requireSelfOrRole('admin', 'front_desk'),
  validate(memberIdParamSchema, 'params'),
  (req, res) => addressController.deleteAddress(req, res)
);

export default router;
