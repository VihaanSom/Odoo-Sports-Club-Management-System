import { Router } from 'express';
import tablesRoutes from './tables/tables.routes';
import tabsRoutes from './tabs/tabs.routes';

const router = Router();

// BT-01 to BT-03: Bar Tables
router.use('/tables', tablesRoutes);

// TB-01 to TB-05: Bar Tabs & POS Lifecycle
router.use('/tabs', tabsRoutes);

export default router;
