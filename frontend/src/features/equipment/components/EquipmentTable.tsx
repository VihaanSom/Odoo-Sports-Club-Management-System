import { Link } from 'react-router-dom';
import {
  FaCircleCheck,
  FaTriangleExclamation,
} from 'react-icons/fa6';

import { Badge } from '@/components/ui';
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
              <th>Stock</th>
              <th>Condition</th>
              <th>Price / Rate</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const stock = item.stockQty ?? item.quantityAvailable ?? 0;
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
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-base-content">
                        {stock}
                      </span>
                      {stock === 0 ? (
                        <Badge size="xs" variant="error">
                          Out of stock
                        </Badge>
                      ) : stock <= 5 ? (
                        <Badge size="xs" variant="warning" className="gap-1">
                          <FaTriangleExclamation className="size-2.5" /> Low
                        </Badge>
                      ) : null}
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
