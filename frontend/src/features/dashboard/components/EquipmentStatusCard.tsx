import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaArrowUpRightFromSquare, FaBoxesStacked } from 'react-icons/fa6';
import { equipmentService } from '@/services/equipmentService';
import type { EquipmentItem } from '@/types/equipment';

export const EquipmentStatusCard = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchEquipment = async () => {
      try {
        const res = await equipmentService.getEquipmentList();
        if (isMounted) {
          setItems(res.slice(0, 5));
        }
      } catch {
        // Fallback in equipmentService
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEquipment();
    return () => {
      isMounted = false;
    };
  }, []);

  const getProgressColor = (stock: number, threshold: number) => {
    if (stock <= 2) return 'progress-error';
    if (stock <= threshold) return 'progress-warning';
    return 'progress-primary';
  };

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs h-full flex flex-col justify-between">
      <div className="card-body p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-base-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <FaDumbbell className="size-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight">Pro Shop Inventory</h3>
                <p className="text-[11px] text-base-content/60">Stock levels on sports gear & balls</p>
              </div>
            </div>

            <Link
              to="/equipment"
              className="btn btn-ghost btn-xs text-primary gap-1"
              title="Manage Pro Shop Inventory"
            >
              <FaArrowUpRightFromSquare className="size-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-base-300/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3.5">
              {items.map((item) => {
                const maxCap = Math.max(item.stockQty + 10, item.lowStockThreshold * 3, 20);
                const isLow = item.stockQty <= item.lowStockThreshold;

                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold truncate max-w-[170px] text-base-content">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-mono font-bold ${isLow ? 'text-warning' : 'text-base-content'}`}>
                          {item.stockQty} in stock
                        </span>
                        {isLow && (
                          <span className="badge badge-warning badge-xs font-semibold">Low</span>
                        )}
                      </div>
                    </div>
                    <progress
                      className={`progress ${getProgressColor(item.stockQty, item.lowStockThreshold)} w-full h-2`}
                      value={item.stockQty}
                      max={maxCap}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-base-300">
          <Link
            to="/equipment"
            className="btn btn-outline btn-sm btn-block gap-2 text-xs font-semibold"
          >
            <FaBoxesStacked className="size-3.5" />
            <span>Manage All Equipment</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EquipmentStatusCard;
