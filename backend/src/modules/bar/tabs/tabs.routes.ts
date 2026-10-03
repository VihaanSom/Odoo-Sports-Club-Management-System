import { Router } from 'express';
import { barTabsController } from './tabs.controller';
import { verifyToken, requireRole } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
  tabIdParamSchema,
  listTabsQuerySchema,
  openTabSchema,
  addTabItemsSchema,
  settleTabSchema,
} from './tabs.validator';

const router = Router();

/**
 * TB-01: List open tabs with filters
 * GET /api/v1/bar/tabs
 * Auth: admin, bar
 */
router.get(
  '/',
  verifyToken,
  requireRole('admin', 'bar'),
  validate(listTabsQuerySchema, 'query'),
  (req, res) => barTabsController.listTabs(req, res)
);

/**
 * TB-02: Open new tab on a table
 * POST /api/v1/bar/tabs
 * Auth: admin, bar
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'bar'),
  validate(openTabSchema, 'body'),
  (req, res) => barTabsController.openTab(req, res)
);

/**
 * TB-03: Get tab detail
 * GET /api/v1/bar/tabs/:id
 * Auth: admin, bar, member (own only)
 */
router.get(
  '/:id',
  verifyToken,
  requireRole('admin', 'bar', 'member'),
  validate(tabIdParamSchema, 'params'),
  (req, res) => barTabsController.getTab(req, res)
);

/**
 * TB-04: Add items to tab
 * POST /api/v1/bar/tabs/:id/items
 * Auth: admin, bar
 */
router.post(
  '/:id/items',
  verifyToken,
  requireRole('admin', 'bar'),
  validate(tabIdParamSchema, 'params'),
  validate(addTabItemsSchema, 'body'),
  (req, res) => barTabsController.addItems(req, res)
);

/**
 * TB-05: Settle tab
 * PUT /api/v1/bar/tabs/:id/settle
 * Auth: admin, bar
 */
router.put(
  '/:id/settle',
  verifyToken,
  requireRole('admin', 'bar'),
  validate(tabIdParamSchema, 'params'),
  validate(settleTabSchema, 'body'),
  (req, res) => barTabsController.settleTab(req, res)
);

export default router;
