import { Router } from 'express';
import tablesRoutes from './tables/tables.routes';
import tabsRoutes from './tabs/tabs.routes';

const router = Router();

router.use('/tables', tablesRoutes);
router.use('/tabs', tabsRoutes);

export default router;


