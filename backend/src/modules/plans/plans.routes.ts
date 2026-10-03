import { Router } from 'express';
import { plansController } from './plans.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createPlanSchema, updatePlanSchema, planIdParamSchema } from './plans.validator';

const router = Router();

/**
 * MP-01: List all membership plans
 * GET /api/v1/membership-plans
 */
router.get('/', verifyToken, (req, res) => plansController.getPlans(req, res));

/**
 * MP-02: Create new membership plan
 * POST /api/v1/membership-plans
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  validate(createPlanSchema, 'body'),
  (req, res) => plansController.createPlan(req, res)
);

/**
 * MP-03: Update membership plan
 * PUT /api/v1/membership-plans/:id
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validate(planIdParamSchema, 'params'),
  validate(updatePlanSchema, 'body'),
  (req, res) => plansController.updatePlan(req, res)
);

export default router;
