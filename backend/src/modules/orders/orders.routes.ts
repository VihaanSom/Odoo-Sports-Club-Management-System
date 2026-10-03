import { Router } from 'express';
import { ordersController } from './orders.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  orderIdParamSchema,
  listOrdersQuerySchema,
  createOrderSchema,
  updateOrderStatusSchema,
} from './orders.validator';

const router = Router();

/**
 * OR-01: List orders with filters & pagination
 * GET /api/v1/orders
 * Auth: admin, front_desk, shop, member (own only)
 */
router.get(
  '/',
  verifyToken,
  requireRole('admin', 'front_desk', 'shop', 'member'),
  validate(listOrdersQuerySchema, 'query'),
  (req, res) => ordersController.listOrders(req, res)
);

/**
 * OR-02: Create shop order (ACID stock deduction)
 * POST /api/v1/orders
 * Auth: admin, front_desk, shop, member (self only)
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'front_desk', 'shop', 'member'),
  validate(createOrderSchema, 'body'),
  (req, res) => ordersController.createOrder(req, res)
);

/**
 * OR-03: Get order detail with line items
 * GET /api/v1/orders/:id
 * Auth: admin, front_desk, shop, member (own only)
 */
router.get(
  '/:id',
  verifyToken,
  requireRole('admin', 'front_desk', 'shop', 'member'),
  validate(orderIdParamSchema, 'params'),
  (req, res) => ordersController.getOrder(req, res)
);

/**
 * OR-04: Update order status (state machine transition)
 * PUT /api/v1/orders/:id/status
 * Auth: admin, front_desk, shop
 */
router.put(
  '/:id/status',
  verifyToken,
  requireRole('admin', 'front_desk', 'shop'),
  validate(orderIdParamSchema, 'params'),
  validate(updateOrderStatusSchema, 'body'),
  (req, res) => ordersController.updateStatus(req, res)
);

export default router;
