import { Router } from 'express';
import { bookingController } from './booking.controller';
import { authenticate, requireRoles } from '../../middlewares/auth.middleware';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../../middlewares/validate.middleware';
import {
  listBookingsQuerySchema,
  bookingIdParamSchema,
  createBookingSchema,
  cancelBookingSchema,
  createSocialBookingSchema,
  todayBookingsQuerySchema,
} from './booking.schema';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// BK-06: Today's bookings for all courts (must be before /:id)
router.get(
  '/today',
  requireRoles('admin', 'front_desk'),
  validateQuery(todayBookingsQuerySchema),
  (req, res, next) => bookingController.getTodayBookings(req, res, next)
);

// BK-05: Create social play booking (must be before /:id)
router.post(
  '/social',
  requireRoles('admin', 'front_desk'),
  validateBody(createSocialBookingSchema),
  (req, res, next) => bookingController.createSocialBooking(req, res, next)
);

// BK-01: List bookings with filters & pagination
router.get(
  '/',
  requireRoles('admin', 'front_desk', 'member'),
  validateQuery(listBookingsQuerySchema),
  (req, res, next) => bookingController.listBookings(req, res, next)
);

// BK-02: Create member or walk-in booking
router.post(
  '/',
  requireRoles('admin', 'front_desk', 'member'),
  validateBody(createBookingSchema),
  (req, res, next) => bookingController.createBooking(req, res, next)
);

// BK-03: Get booking detail by ID
router.get(
  '/:id',
  requireRoles('admin', 'front_desk', 'member'),
  validateParams(bookingIdParamSchema),
  (req, res, next) => bookingController.getBookingById(req, res, next)
);

// BK-04: Cancel confirmed booking
router.put(
  '/:id/cancel',
  requireRoles('admin', 'front_desk', 'member'),
  validateParams(bookingIdParamSchema),
  validateBody(cancelBookingSchema),
  (req, res, next) => bookingController.cancelBooking(req, res, next)
);

export default router;
