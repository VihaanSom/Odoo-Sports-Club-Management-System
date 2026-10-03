import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTriangleExclamation,
  FaCircleCheck,
  FaArrowUpRightFromSquare,
  FaDumbbell,
  FaUtensils,
} from 'react-icons/fa6';
import { equipmentService } from '@/services/equipmentService';
import { menuService } from '@/services/menuService';

interface LowStockItem {
  id: string | number;
  name: string;
  type: 'equipment' | 'menu';
  stockQty: number;
  threshold: number;
  category?: string;
}

export const LowStockAlerts = () => {
  const [alerts, setAlerts] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLowStock = async () => {
      try {
        const [equipmentAlerts, menuItems] = await Promise.all([
          equipmentService.getLowStockAlerts(),
          menuService.getMenuItems(),
        ]);

        if (isMounted) {
          const eqList: LowStockItem[] = equipmentAlerts.map((e) => ({
            id: `eq-${e.id}`,
            name: e.name,
            type: 'equipment',
            stockQty: e.stockQty,
            threshold: e.lowStockThreshold,
            category: e.category,
          }));

          const menuLow: LowStockItem[] = menuItems
            .filter((m) => m.stockQty <= (m.lowStockThreshold ?? 5))
            .map((m) => ({
              id: `menu-${m.id}`,
              name: m.name,
              type: 'menu',
              stockQty: m.stockQty,
              threshold: m.lowStockThreshold ?? 5,
              category: m.category,
            }));

          setAlerts([...eqList, ...menuLow].slice(0, 5));
        }
      } catch {
        // Handled
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLowStock();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs h-full flex flex-col justify-between">
      <div className="card-body p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-base-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <FaTriangleExclamation className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">Low Stock Alerts</h3>
                  {alerts.length > 0 && (
                    <span className="badge badge-error badge-xs font-bold">{alerts.length}</span>
                  )}
                </div>
                <p className="text-[11px] text-base-content/60">Inventory & F&B items below reorder threshold</p>
              </div>
            </div>

            <Link
              to="/equipment"
              className="btn btn-ghost btn-xs text-primary gap-1"
              title="View inventory"
            >
              <FaArrowUpRightFromSquare className="size-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-11 bg-base-300/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <FaCircleCheck className="size-8 text-success mb-2" />
              <p className="font-bold text-xs text-base-content">Inventory Healthy</p>
              <p className="text-[11px] text-base-content/60 mt-0.5">
                All equipment and menu stock levels are above threshold.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-warning/30 bg-warning/5 flex items-center justify-between gap-2 hover:border-warning/60 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-base-300/60 shrink-0 text-base-content/70">
                      {item.type === 'equipment' ? (
                        <FaDumbbell className="size-3.5 text-accent" />
                      ) : (
                        <FaUtensils className="size-3.5 text-warning" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-base-content truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-base-content/60 flex items-center gap-1">
                        <span className="capitalize">{item.category || item.type}</span>
                        <span>•</span>
                        <span>Threshold: {item.threshold}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`badge badge-sm font-bold ${
                        item.stockQty <= 2 ? 'badge-error' : 'badge-warning'
                      }`}
                    >
                      {item.stockQty} left
                    </span>
                    <Link
                      to={item.type === 'equipment' ? '/equipment' : '/menu'}
                      className="btn btn-ghost btn-xs text-xs font-semibold text-primary px-1.5"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between text-xs text-base-content/60">
          <span>Reorder system automated via Odoo ERP</span>
          <Link to="/settings" className="link link-primary font-medium text-[11px]">
            ERP Sync
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlerts;
