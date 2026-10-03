import { Router } from 'express';
import { plansController } from './plans.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createPlanSchema, updatePlanSchema, planIdParamSchema } from './plans.validator';

const router = Router();

// All membership-plans routes require Bearer JWT and 'admin' role
router.use(verifyToken, requireRole('admin'));

/**
 * MP-01: List all membership plans (admin view)
 * GET /api/v1/membership-plans
 */
router.get('/', (req, res) => plansController.getPlans(req, res));

/**
 * MP-02: Create new membership plan
 * POST /api/v1/membership-plans
 */
router.post(
  '/',
  validate(createPlanSchema, 'body'),
  (req, res) => plansController.createPlan(req, res)
);

/**
 * MP-03: Update membership plan
 * PUT /api/v1/membership-plans/:id
 */
router.put(
  '/:id',
  validate(planIdParamSchema, 'params'),
  validate(updatePlanSchema, 'body'),
  (req, res) => plansController.updatePlan(req, res)
);

export default router;
