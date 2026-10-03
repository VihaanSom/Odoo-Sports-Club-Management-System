import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { authenticate, requireRoles } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../utils/response';

const router = Router();

// IV-01: Low-stock alerts
// Auth: admin, shop, bar
router.get(
  '/low-stock',
  authenticate,
  requireRoles('admin', 'shop', 'bar'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Find equipment where stockQty <= lowStockThreshold
      const equipmentItems = await prisma.$queryRaw<
        Array<{ id: number; name: string; stock_qty: number; low_stock_threshold: number }>
      >`
        SELECT id, name, stock_qty, low_stock_threshold
        FROM equipment
        WHERE stock_qty <= low_stock_threshold
        ORDER BY stock_qty ASC
      `;

      // Find menu items where stockQty <= lowStockThreshold
      const menuItems = await prisma.$queryRaw<
        Array<{ id: number; name: string; stock_qty: number; low_stock_threshold: number }>
      >`
        SELECT id, name, stock_qty, low_stock_threshold
        FROM menu_items
        WHERE stock_qty <= low_stock_threshold
        ORDER BY stock_qty ASC
      `;

      const formattedEquipment = equipmentItems.map((e) => ({
        id: e.id,
        name: e.name,
        stockQty: e.stock_qty,
        lowStockThreshold: e.low_stock_threshold,
      }));

      const formattedMenuItems = menuItems.map((m) => ({
        id: m.id,
        name: m.name,
        stockQty: m.stock_qty,
        lowStockThreshold: m.low_stock_threshold,
      }));

      sendSuccess(res, {
        equipment: formattedEquipment,
        menuItems: formattedMenuItems,
      }, 'Low-stock inventory items retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
