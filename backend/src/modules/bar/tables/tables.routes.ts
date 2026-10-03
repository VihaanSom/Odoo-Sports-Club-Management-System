import { Router } from 'express';
import { barTablesController } from './tables.controller';
import { verifyToken, requireRole } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
  tableIdParamSchema,
  createTableSchema,
  updateTableSchema,
} from './tables.validator';

const router = Router();

/**
 * BT-01: List bar tables
 * GET /api/v1/bar/tables
 * Auth: admin, bar
 */
router.get(
  '/',
  verifyToken,
  requireRole('admin', 'bar'),
  (req, res) => barTablesController.listTables(req, res)
);

/**
 * BT-02: Create bar table
 * POST /api/v1/bar/tables
 * Auth: admin
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  validate(createTableSchema, 'body'),
  (req, res) => barTablesController.createTable(req, res)
);

/**
 * BT-03: Update bar table
 * PUT /api/v1/bar/tables/:id
 * Auth: admin
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validate(tableIdParamSchema, 'params'),
  validate(updateTableSchema, 'body'),
  (req, res) => barTablesController.updateTable(req, res)
);

export default router;
