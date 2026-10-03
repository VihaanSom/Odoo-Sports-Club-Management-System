import { Router } from 'express';
import { menuController } from './menu.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  listMenuItemsQuerySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  menuItemIdParamSchema,
} from './menu.validator';

const router = Router();

/**
 * All menu routes require an authenticated user
 */
router.use(verifyToken);

/**
 * MI-01: List menu items
 * GET /api/v1/menu-items
 * Auth: All authenticated roles
 */
router.get(
  '/',
  validate(listMenuItemsQuerySchema, 'query'),
  (req, res) => menuController.listMenuItems(req, res)
);

/**
 * MI-02: Create menu item
 * POST /api/v1/menu-items
 * Auth: admin, bar
 */
router.post(
  '/',
  requireRole('admin', 'bar'),
  validate(createMenuItemSchema, 'body'),
  (req, res) => menuController.createMenuItem(req, res)
);

/**
 * MI-03: Get menu item details
 * GET /api/v1/menu-items/:id
 * Auth: All authenticated roles
 */
router.get(
  '/:id',
  validate(menuItemIdParamSchema, 'params'),
  (req, res) => menuController.getMenuItem(req, res)
);

/**
 * MI-04: Update menu item
 * PUT /api/v1/menu-items/:id
 * Auth: admin, bar
 */
router.put(
  '/:id',
  requireRole('admin', 'bar'),
  validate(menuItemIdParamSchema, 'params'),
  validate(updateMenuItemSchema, 'body'),
  (req, res) => menuController.updateMenuItem(req, res)
);

export default router;
