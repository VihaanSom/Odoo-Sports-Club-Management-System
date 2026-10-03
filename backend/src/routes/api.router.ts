import { Router } from 'express';

// Completed Modules (Dev A & Dev B)
import authRoutes from '../modules/auth/auth.routes';
import courtRoutes from '../modules/courts/court.routes';
import memberRoutes from '../modules/members/members.routes';
import planRoutes from '../modules/plans/plans.routes';
import equipmentRoutes from '../modules/equipment/equipment.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import menuRoutes from '../modules/menu/menu.routes';
import barRoutes from '../modules/bar/bar.routes';
import bookingRoutes from '../modules/bookings/booking.routes';
import membersRoutes from '../modules/members/members.routes';
import plansRoutes from '../modules/plans/plans.routes';
import leadsRoutes, { publicRoutes } from '../modules/leads/leads.routes';

// Domain Modules (Stubs / In Progress)
import equipmentRoutes from '../modules/equipment/equipment.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import barRoutes from '../modules/bar/bar.routes';
import menuRoutes from '../modules/menu/menu.routes';
import leadsRoutes from '../modules/leads/leads.routes';
import staffRoutes from '../modules/staff/staff.routes';
import paymentsRoutes from '../modules/payments/payments.routes';

import { sendSuccess } from '../utils/response';

const router = Router();

// HE-01: Health check endpoint
router.get('/health', (_req, res) => {
  sendSuccess(res, {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, 'Champions Club Backend API is running healthy');
});

// ==========================================
// ACTIVE & COMPLETED MODULES
// ==========================================
router.use('/auth', authRoutes);
router.use('/courts', courtRoutes);
router.use('/members', memberRoutes);
router.use('/membership-plans', planRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/orders', ordersRoutes);
router.use('/menu-items', menuRoutes);
router.use('/menu', menuRoutes);
router.use('/bar', barRoutes);
router.use('/bookings', bookingRoutes);
router.use('/members', membersRoutes);
router.use('/membership-plans', plansRoutes);
router.use('/plans', plansRoutes); // Alias
router.use('/public', publicRoutes);
router.use('/leads', leadsRoutes);

// ==========================================
// REMAINING MODULE ROUTE REGISTRATIONS
// ==========================================
router.use('/equipment', equipmentRoutes);
router.use('/orders', ordersRoutes);
router.use('/bar', barRoutes);
router.use('/menu-items', menuRoutes);
router.use('/menu', menuRoutes);
router.use('/staff', staffRoutes);
router.use('/payments', paymentsRoutes);

export default router;
