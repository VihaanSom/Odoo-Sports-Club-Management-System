import { Router } from 'express';
import tablesRoutes from './tables/tables.routes';
import tabsRoutes from './tabs/tabs.routes';
import { barTabsController } from './tabs/tabs.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

// BT-01 to BT-03: Bar Tables
router.use('/tables', tablesRoutes);

// TB-07: Bar earnings today endpoint (GET /api/v1/bar/earnings/today)
router.get(
  '/earnings/today',
  verifyToken,
  requireRole('admin', 'bar'),
  (req, res) => barTabsController.getTodayEarnings(req, res)
);

// TB-01 to TB-06: Bar Tabs & POS Lifecycle
router.use('/tabs', tabsRoutes);

export default router;
