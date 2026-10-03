import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import membersRoutes from '../modules/members/members.routes';
import courtsRoutes from '../modules/courts/courts.routes';
import bookingsRoutes from '../modules/bookings/bookings.routes';
import equipmentRoutes from '../modules/equipment/equipment.routes';
import menuRoutes from '../modules/menu/menu.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import barRoutes from '../modules/bar/bar.routes';
import leadsRoutes from '../modules/leads/leads.routes';
import staffRoutes from '../modules/staff/staff.routes';
import paymentsRoutes from '../modules/payments/payments.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', membersRoutes);
router.use('/courts', courtsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', ordersRoutes);
router.use('/bar', barRoutes);
router.use('/leads', leadsRoutes);
router.use('/staff', staffRoutes);
router.use('/payments', paymentsRoutes);

export default router;
