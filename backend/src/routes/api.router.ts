import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import courtRoutes from '../modules/courts/court.routes';
import bookingRoutes from '../modules/bookings/booking.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);

export default router;
