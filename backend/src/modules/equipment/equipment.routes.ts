import { Router } from 'express';
import { equipmentController } from './equipment.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  equipmentIdParamSchema,
  listEquipmentQuerySchema,
  createEquipmentSchema,
  updateEquipmentSchema,
  adjustStockSchema,
} from './equipment.validator';

const router = Router();

/**
 * EQ-01: List equipment catalogue
 * GET /api/v1/equipment
 * Auth: All authenticated roles
 */
router.get(
  '/',
  verifyToken,
  validate(listEquipmentQuerySchema, 'query'),
  (req, res) => equipmentController.listEquipment(req, res)
);

/**
 * EQ-06: Low stock alerts
 * GET /api/v1/equipment/alerts/low-stock
 * Auth: admin, shop
 */
router.get(
  '/alerts/low-stock',
  verifyToken,
  requireRole('admin', 'shop'),
  (req, res) => equipmentController.getLowStockAlerts(req, res)
);

/**
 * EQ-02: Create equipment item
 * POST /api/v1/equipment
 * Auth: admin, shop
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'shop'),
  validate(createEquipmentSchema, 'body'),
  (req, res) => equipmentController.createEquipment(req, res)
);

/**
 * EQ-03: Get equipment detail
 * GET /api/v1/equipment/:id
 * Auth: All authenticated roles
 */
router.get(
  '/:id',
  verifyToken,
  validate(equipmentIdParamSchema, 'params'),
  (req, res) => equipmentController.getEquipment(req, res)
);

/**
 * EQ-04: Update equipment details / restock
 * PUT /api/v1/equipment/:id
 * Auth: admin, shop
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('admin', 'shop'),
  validate(equipmentIdParamSchema, 'params'),
  validate(updateEquipmentSchema, 'body'),
  (req, res) => equipmentController.updateEquipment(req, res)
);

/**
 * EQ-05: Adjust stock
 * POST /api/v1/equipment/:id/adjust-stock
 * Auth: admin, shop
 */
router.post(
  '/:id/adjust-stock',
  verifyToken,
  requireRole('admin', 'shop'),
  validate(equipmentIdParamSchema, 'params'),
  validate(adjustStockSchema, 'body'),
  (req, res) => equipmentController.adjustStock(req, res)
);

export default router;
