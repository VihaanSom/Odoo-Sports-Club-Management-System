import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import courtRoutes from '../modules/courts/court.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courts', courtRoutes);

export default router;
