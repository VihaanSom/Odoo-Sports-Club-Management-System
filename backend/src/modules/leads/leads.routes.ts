import { Router } from 'express';
import { leadsController } from './leads.controller';
import { authenticate, requireRoles } from '../../middlewares/auth.middleware';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../../middlewares/validate.middleware';
import {
  listLeadsQuerySchema,
  leadIdParamSchema,
  updateLeadSchema,
} from './leads.schema';
import publicRoutes from './public.routes';

const router = Router();

// Re-export public routes
export { publicRoutes };

// LD-01: List leads with pagination and filters
router.get(
  '/',
  authenticate,
  requireRoles('admin', 'front_desk'),
  validateQuery(listLeadsQuerySchema),
  (req, res, next) => leadsController.listLeads(req, res, next)
);

// LD-02: Get single lead detail
router.get(
  '/:id',
  authenticate,
  requireRoles('admin', 'front_desk'),
  validateParams(leadIdParamSchema),
  (req, res, next) => leadsController.getLeadById(req, res, next)
);

// LD-03: Update lead status & staff assignment (PUT / PATCH)
router.put(
  '/:id',
  authenticate,
  requireRoles('admin', 'front_desk'),
  validateParams(leadIdParamSchema),
  validateBody(updateLeadSchema),
  (req, res, next) => leadsController.updateLead(req, res, next)
);
router.patch(
  '/:id',
  authenticate,
  requireRoles('admin', 'front_desk'),
  validateParams(leadIdParamSchema),
  validateBody(updateLeadSchema),
  (req, res, next) => leadsController.updateLead(req, res, next)
);

export default router;
