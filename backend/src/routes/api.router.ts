import { Router } from 'express';

// Domain Module Routes
import authRoutes from '../modules/auth/auth.routes';
import courtRoutes from '../modules/courts/court.routes';
import memberRoutes from '../modules/members/members.routes';
import planRoutes from '../modules/plans/plans.routes';
import equipmentRoutes from '../modules/equipment/equipment.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import menuRoutes from '../modules/menu/menu.routes';
import barRoutes from '../modules/bar/bar.routes';
import bookingRoutes from '../modules/bookings/booking.routes';
import leadsRoutes, { publicRoutes } from '../modules/leads/leads.routes';
import staffRoutes from '../modules/staff/staff.routes';
import leaveRoutes from '../modules/staff/leave.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import reportsRoutes from '../modules/reports/reports.routes';
import invoicesRoutes from '../modules/invoices/invoices.routes';
import inventoryRoutes from '../modules/inventory/inventory.routes';
import uploadsRoutes from '../modules/uploads/uploads.routes';

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
// CORE DOMAIN ROUTE REGISTRATIONS
// ==========================================
router.use('/auth', authRoutes);
router.use('/courts', courtRoutes);
router.use('/members', memberRoutes);
router.use('/membership-plans', planRoutes);
router.use('/plans', planRoutes); // Alias
router.use('/equipment', equipmentRoutes);
router.use('/orders', ordersRoutes);
router.use('/menu-items', menuRoutes);
router.use('/menu', menuRoutes); // Alias
router.use('/bar', barRoutes);
router.use('/bookings', bookingRoutes);
router.use('/public', publicRoutes);
router.use('/leads', leadsRoutes);
router.use('/staff', staffRoutes);
router.use('/leave', leaveRoutes);
router.use('/payments', paymentsRoutes);
router.use('/reports', reportsRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/uploads', uploadsRoutes);

export default router;
