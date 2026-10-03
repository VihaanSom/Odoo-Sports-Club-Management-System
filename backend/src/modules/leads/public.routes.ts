import { Router } from 'express';
import { leadsController } from './leads.controller';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import {
  submitLeadSchema,
  requestTrialSchema,
  publicRegisterSchema,
  publicEquipmentQuerySchema,
  publicSlotsQuerySchema,
} from './leads.schema';

const router = Router();

// PU-01: Get active membership plans grouped by tier
router.get('/plans', (req, res, next) => leadsController.getPublicPlans(req, res, next));

// PU-02: Get active courts list
router.get('/courts', (req, res, next) => leadsController.getPublicCourts(req, res, next));

// PU-03: Get public shop catalogue
router.get(
  '/equipment',
  validateQuery(publicEquipmentQuerySchema),
  (req, res, next) => leadsController.getPublicEquipment(req, res, next)
);

// PU-04: Get public slot availability
router.get(
  '/slots',
  validateQuery(publicSlotsQuerySchema),
  (req, res, next) => leadsController.getPublicSlots(req, res, next)
);

// PU-05: Submit visitor inquiry
router.post(
  '/leads',
  validateBody(submitLeadSchema),
  (req, res, next) => leadsController.submitPublicLead(req, res, next)
);

// PU-06: Request trial session
router.post(
  '/trial',
  validateBody(requestTrialSchema),
  (req, res, next) => leadsController.requestPublicTrial(req, res, next)
);

// PU-07: Member self-registration
router.post(
  '/register',
  validateBody(publicRegisterSchema),
  (req, res, next) => leadsController.registerPublicMember(req, res, next)
);

export default router;
