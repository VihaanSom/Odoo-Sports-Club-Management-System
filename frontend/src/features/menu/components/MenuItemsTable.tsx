import { Link } from 'react-router-dom';
import { FaPenToSquare, FaFolderOpen, FaTriangleExclamation } from 'react-icons/fa6';
import { formatPaise } from '@/lib/utils';
import type { MenuItem } from '@/types/menu';

interface MenuItemsTableProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
}

export const MenuItemsTable = ({
  items,
  onEdit,
  onToggleAvailability,
}: MenuItemsTableProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-base-100 border border-base-300 rounded-2xl">
        <p className="text-base-content/60 text-sm">No menu items found.</p>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra table-sm">
          <thead>
            <tr className="text-xs text-base-content/60 uppercase bg-base-200/50">
              <th>Item</th>
              <th>Category</th>
              <th className="text-right">Price</th>
              <th className="text-center">Stock</th>
              <th className="text-center">Available</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLowStock = item.stockQty <= item.lowStockThreshold;

              return (
                <tr key={item.id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-10 rounded-lg object-cover border border-base-300"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-base-300 flex items-center justify-center font-bold text-xs text-base-content/50">
                          F&B
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/menu/${item.id}`}
                          className="font-bold text-sm hover:underline hover:text-primary transition-colors text-base-content"
                        >
                          {item.name}
                        </Link>
                        {item.description && (
                          <p className="text-xs text-base-content/60 line-clamp-1 max-w-xs">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-sm badge-outline uppercase font-semibold text-[10px]">
                      {item.category}
                    </span>
                  </td>

                  <td className="text-right font-mono font-bold text-sm">
                    {formatPaise(item.pricePaise)}
                  </td>

                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-mono text-xs">{item.stockQty}</span>
                      {isLowStock && (
                        <span
                          className="badge badge-error badge-xs gap-1 font-semibold text-[10px]"
                          title={`Low stock alert (<= ${item.lowStockThreshold})`}
                        >
                          <FaTriangleExclamation className="size-2.5" /> Low
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={() => onToggleAvailability(item)}
                      className="toggle toggle-primary toggle-sm"
                      title={item.isAvailable ? 'Item Active' : 'Item Disabled'}
                    />
                  </td>

                  <td className="text-right space-x-1">
                    <Link
                      to={`/menu/${item.id}`}
                      className="btn btn-ghost btn-xs gap-1"
                    >
                      <FaFolderOpen className="size-3" /> View
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="btn btn-ghost btn-xs gap-1"
                    >
                      <FaPenToSquare className="size-3" /> Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
