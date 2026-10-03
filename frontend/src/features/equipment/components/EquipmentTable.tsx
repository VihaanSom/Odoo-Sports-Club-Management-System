import { Link } from 'react-router-dom';
import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaHandHoldingHand,
  FaRotateLeft,
} from 'react-icons/fa6';

import { Badge, Button, ProgressBar } from '@/components/ui';
import type { Equipment } from '@/types';

interface EquipmentTableProps {
  items: Equipment[];
  onRent: (id: string, name: string) => void;
  onReturn: (id: string, name: string) => void;
}

export const EquipmentTable = ({
  items,
  onRent,
  onReturn,
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
              <th>Rental / Slot</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const percent = Math.round((item.quantityAvailable / item.quantityTotal) * 100);

              return (
                <tr key={item.id} className="hover:bg-base-300/30">
                  <td>
                    <div>
                      <Link
                        to={`/equipment/${item.id.replace(/\D/g, '') || item.id}`}
                        className="font-bold hover:underline hover:text-primary transition-colors text-base-content"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-base-content/50 font-mono block">{item.id}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant="outline" size="sm">
                      {item.category}
                    </Badge>
                  </td>
                  <td>
                    <div className="w-36">
                      <ProgressBar
                        value={item.quantityAvailable}
                        max={item.quantityTotal}
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
                      {item.condition}
                    </Badge>
                  </td>
                  <td>
                    <span className="font-semibold">${item.rentalRate}</span>
                    <span className="text-xs text-base-content/60"> / booking</span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/equipment/${item.id.replace(/\D/g, '') || item.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        View
                      </Link>
                      <Button
                        size="xs"
                        variant="primary"
                        disabled={item.quantityAvailable <= 0}
                        onClick={() => onRent(item.id, item.name)}
                        leftIcon={<FaHandHoldingHand className="size-3" />}
                        title="Issue to member"
                      >
                        Rent
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={item.quantityAvailable >= item.quantityTotal}
                        onClick={() => onReturn(item.id, item.name)}
                        leftIcon={<FaRotateLeft className="size-3" />}
                        title="Return to stock"
                      >
                        Return
                      </Button>
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
