import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate, requireRoles } from '../../middlewares/auth.middleware';
import { validateQuery } from '../../middlewares/validate.middleware';
import {
  revenueReportQuerySchema,
  courtsReportQuerySchema,
  membersReportQuerySchema,
  inventoryReportQuerySchema,
  barReportQuerySchema,
  staffReportQuerySchema,
} from './reports.schema';

const router = Router();

// All reporting endpoints require admin authentication
router.use(authenticate);
router.use(requireRoles('admin'));

// RP-01: Revenue report
router.get(
  '/revenue',
  validateQuery(revenueReportQuerySchema),
  (req, res, next) => reportsController.getRevenueReport(req, res, next)
);

// RP-02: Court utilisation report
router.get(
  '/courts',
  validateQuery(courtsReportQuerySchema),
  (req, res, next) => reportsController.getCourtsReport(req, res, next)
);

// RP-03: Member analytics report
router.get(
  '/members',
  validateQuery(membersReportQuerySchema),
  (req, res, next) => reportsController.getMembersReport(req, res, next)
);

// RP-04: Inventory report
router.get(
  '/inventory',
  validateQuery(inventoryReportQuerySchema),
  (req, res, next) => reportsController.getInventoryReport(req, res, next)
);

// RP-05: Bar earnings report
router.get(
  '/bar',
  validateQuery(barReportQuerySchema),
  (req, res, next) => reportsController.getBarReport(req, res, next)
);

// RP-06: Staff report
router.get(
  '/staff',
  validateQuery(staffReportQuerySchema),
  (req, res, next) => reportsController.getStaffReport(req, res, next)
);

export default router;
