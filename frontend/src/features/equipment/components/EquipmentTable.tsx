import { Link } from 'react-router-dom';
import {
  FaCircleCheck,
  FaTriangleExclamation,
} from 'react-icons/fa6';

import { Badge, ProgressBar } from '@/components/ui';
import { formatPaise } from '@/lib/utils';
import type { Equipment } from '@/types';

interface EquipmentTableProps {
  items: Equipment[];
  canManage?: boolean;
  onRent?: (id: string | number, name: string) => void;
  onReturn?: (id: string | number, name: string) => void;
}

export const EquipmentTable = ({
  items,
}: EquipmentTableProps) => {
  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-sm">
          <thead>
            <tr className="bg-base-300/40">
              <th>Equipment Name</th>
              <th>Category</th>
              <th>Availability</th>
              <th>Condition</th>
              <th>Price / Rate</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const qtyAvail = item.quantityAvailable ?? item.stockQty ?? 0;
              const qtyTotal = item.quantityTotal ?? item.stockQty ?? 1;
              const percent = qtyTotal > 0 ? Math.round((qtyAvail / qtyTotal) * 100) : 0;
              const itemId = String(item.id);

              return (
                <tr key={itemId} className="hover:bg-base-300/30">
                  <td>
                    <div>
                      <Link
                        to={`/equipment/${itemId}`}
                        className="font-bold hover:underline hover:text-primary transition-colors text-base-content"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-base-content/50 font-mono block">#{itemId}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant="outline" size="sm" className="capitalize">
                      {item.category}
                    </Badge>
                  </td>
                  <td>
                    <div className="w-36">
                      <ProgressBar
                        value={qtyAvail}
                        max={qtyTotal}
                        variant={percent > 50 ? 'success' : percent > 20 ? 'warning' : 'error'}
                        showLabel
                      />
                    </div>
                  </td>
                  <td>
                    <Badge
                      size="sm"
                      variant={
                        item.condition === 'Excellent'
                          ? 'success'
                          : item.condition === 'Good'
                          ? 'info'
                          : 'warning'
                      }
                      className="gap-1"
                    >
                      {item.condition === 'Excellent' ? (
                        <FaCircleCheck className="size-2.5" />
                      ) : (
                        <FaTriangleExclamation className="size-2.5" />
                      )}
                      {item.condition || 'Good'}
                    </Badge>
                  </td>
                  <td>
                    <span className="font-semibold">
                      {formatPaise(item.pricePaise || (item.rentalRate ? item.rentalRate * 100 : 0))}
                    </span>
                    <span className="text-xs text-base-content/60"> retail</span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/equipment/${itemId}`}
                        className="btn btn-ghost btn-xs"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/60">
                  No equipment found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
