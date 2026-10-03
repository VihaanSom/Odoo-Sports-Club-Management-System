import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import courtRoutes from '../modules/courts/court.routes';
import memberRoutes from '../modules/members/members.routes';
import planRoutes from '../modules/plans/plans.routes';
import equipmentRoutes from '../modules/equipment/equipment.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import menuRoutes from '../modules/menu/menu.routes';
import barRoutes from '../modules/bar/bar.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courts', courtRoutes);
router.use('/members', memberRoutes);
router.use('/membership-plans', planRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/orders', ordersRoutes);
router.use('/menu-items', menuRoutes);
router.use('/menu', menuRoutes);
router.use('/bar', barRoutes);

export default router;

