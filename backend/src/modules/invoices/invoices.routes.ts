import { Router } from 'express';
import { invoicesController } from './invoices.controller';
import { authenticate, requireRoles } from '../../middlewares/auth.middleware';
import { validateParams } from '../../middlewares/validate.middleware';
import { memberIdParamSchema } from './invoices.schema';

const router = Router();

// All invoice operations require admin authentication
router.use(authenticate);
router.use(requireRoles('admin'));

// IN-01: List members due for renewal
router.get(
  '/members',
  (req, res, next) => invoicesController.getRenewalMembers(req, res, next)
);

// IN-02: Generate membership invoice
router.post(
  '/:memberId',
  validateParams(memberIdParamSchema),
  (req, res, next) => invoicesController.generateInvoice(req, res, next)
);

export default router;
