import { Router } from 'express';
import { courtController } from './court.controller';
import { authenticate, requireRoles } from '../../middlewares/auth.middleware';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../../middlewares/validate.middleware';
import {
  listCourtsQuerySchema,
  courtAvailabilityQuerySchema,
  createCourtSchema,
  updateCourtSchema,
  courtIdParamSchema,
} from './court.schema';

const router = Router();

// All court endpoints require a valid JWT
router.use(authenticate);

// CO-02: Get slot availability for active courts (Declared before /:id)
router.get(
  '/availability',
  requireRoles('admin', 'front_desk', 'member'),
  validateQuery(courtAvailabilityQuerySchema),
  (req, res, next) => courtController.getCourtAvailability(req, res, next)
);

// CO-01: List courts
router.get(
  '/',
  requireRoles('admin', 'front_desk'),
  validateQuery(listCourtsQuerySchema),
  (req, res, next) => courtController.listCourts(req, res, next)
);

// CO-03: Create new court
router.post(
  '/',
  requireRoles('admin'),
  validateBody(createCourtSchema),
  (req, res, next) => courtController.createCourt(req, res, next)
);

// CO-04: Update court details
router.put(
  '/:id',
  requireRoles('admin'),
  validateParams(courtIdParamSchema),
  validateBody(updateCourtSchema),
  (req, res, next) => courtController.updateCourt(req, res, next)
);

export default router;
