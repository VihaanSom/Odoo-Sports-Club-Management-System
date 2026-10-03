import { Router } from 'express';
import { staffController } from './staff.controller';
import { verifyToken, requireRole, requireSelfOrRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  listStaffQuerySchema,
  createStaffSchema,
  updateStaffSchema,
  staffIdParamSchema,
  startShiftSchema,
  endShiftSchema,
  shiftParamsSchema,
  listLeaveQuerySchema,
  listShiftsQuerySchema,
  assignShiftSchema,
  clockShiftSchema,
} from './staff.validator';
import leaveRoutes from './leave.routes';

const router = Router();

// ==========================================
// LEAVE REQUESTS ALIAS (/api/v1/staff/leaves)
// ==========================================
router.use('/leaves', leaveRoutes);

// ==========================================
// ALL SHIFTS & SCHEDULES (BEFORE /:id)
// ==========================================


/**
 * List all shifts across all staff
 * GET /api/v1/staff/shifts
 * Auth: admin or self
 */
router.get(
  '/shifts',
  verifyToken,
  validate(listShiftsQuerySchema, 'query'),
  (req, res) => staffController.listAllShifts(req, res)
);

/**
 * Assign / schedule a shift
 * POST /api/v1/staff/shifts
 * Auth: admin
 */
router.post(
  '/shifts',
  verifyToken,
  requireRole('admin'),
  validate(assignShiftSchema, 'body'),
  (req, res) => staffController.assignShift(req, res)
);

/**
 * Clock in or out
 * POST /api/v1/staff/shifts/clock
 * Auth: admin or staff
 */
router.post(
  '/shifts/clock',
  verifyToken,
  validate(clockShiftSchema, 'body'),
  (req, res) => staffController.clockInOut(req, res)
);

// ==========================================
// STAFF CRUD (ST-01 to ST-04)
// ==========================================

/**
 * ST-01: List staff members with pagination, filters, and search
 * GET /api/v1/staff
 * Auth: admin
 */
router.get(
  '/',
  verifyToken,
  requireRole('admin'),
  validate(listStaffQuerySchema, 'query'),
  (req, res) => staffController.listStaff(req, res)
);

/**
 * ST-02: Create a new staff member
 * POST /api/v1/staff
 * Auth: admin
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  validate(createStaffSchema, 'body'),
  (req, res) => staffController.createStaff(req, res)
);

/**
 * ST-03: Get staff details by ID
 * GET /api/v1/staff/:id
 * Auth: admin or self
 */
router.get(
  '/:id',
  verifyToken,
  requireSelfOrRole('admin'),
  validate(staffIdParamSchema, 'params'),
  (req, res) => staffController.getStaff(req, res)
);

/**
 * ST-04: Update staff member
 * PUT /api/v1/staff/:id
 * Auth: admin
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validate(staffIdParamSchema, 'params'),
  validate(updateStaffSchema, 'body'),
  (req, res) => staffController.updateStaff(req, res)
);

// ==========================================
// SHIFTS (SH-01, SH-02)
// ==========================================

/**
 * SH-01: Start (clock in) shift
 * POST /api/v1/staff/:id/shifts
 * Auth: admin or self
 */
router.post(
  '/:id/shifts',
  verifyToken,
  requireSelfOrRole('admin'),
  validate(staffIdParamSchema, 'params'),
  validate(startShiftSchema, 'body'),
  (req, res) => staffController.startShift(req, res)
);

/**
 * SH-02: End (clock out) shift
 * PUT /api/v1/staff/:id/shifts/:shiftId
 * Auth: admin or self
 */
router.put(
  '/:id/shifts/:shiftId',
  verifyToken,
  requireSelfOrRole('admin'),
  validate(shiftParamsSchema, 'params'),
  validate(endShiftSchema, 'body'),
  (req, res) => staffController.endShift(req, res)
);

/**
 * List shifts for a specific staff member
 * GET /api/v1/staff/:id/shifts
 * Auth: admin or self
 */
router.get(
  '/:id/shifts',
  verifyToken,
  requireSelfOrRole('admin'),
  validate(staffIdParamSchema, 'params'),
  (req, res) => staffController.getShifts(req, res)
);

// ==========================================
// LEAVE (LV-02)
// ==========================================

/**
 * LV-02: Get leave history for a specific staff member
 * GET /api/v1/staff/:id/leave
 * Auth: admin or self
 */
router.get(
  '/:id/leave',
  verifyToken,
  requireSelfOrRole('admin'),
  validate(staffIdParamSchema, 'params'),
  validate(listLeaveQuerySchema, 'query'),
  (req, res) => staffController.getStaffLeaves(req, res)
);

export default router;
