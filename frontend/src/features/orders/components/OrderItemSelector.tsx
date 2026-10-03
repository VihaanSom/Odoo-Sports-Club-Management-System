import {  useState, useEffect  } from 'react';
import {
  FaMagnifyingGlass,
  FaPlus,
  FaMinus,
  FaTrash,
  FaDumbbell,
  FaUtensils,
  FaBoxOpen,
} from 'react-icons/fa6';
import { equipmentService } from '@/services/equipmentService';
import { menuService } from '@/services/menuService';
import { formatPaise } from '@/lib/utils';
import type { EquipmentItem } from '@/types/equipment';
import type { MenuItem } from '@/types/menu';

export interface SelectedOrderItem {
  itemType: 'equipment' | 'menu';
  itemId: number;
  name: string;
  qty: number;
  unitPricePaise: number;
  imageUrl?: string | null;
}

interface OrderItemSelectorProps {
  selectedItems: SelectedOrderItem[];
  onAddItem: (item: {
    itemType: 'equipment' | 'menu';
    itemId: number;
    name: string;
    unitPricePaise: number;
    imageUrl?: string | null;
  }) => void;
  onUpdateQty: (itemType: 'equipment' | 'menu', itemId: number, delta: number) => void;
  onRemoveItem: (itemType: 'equipment' | 'menu', itemId: number) => void;
}

export const OrderItemSelector = ({
  selectedItems,
  onAddItem,
  onUpdateQty,
  onRemoveItem,
}: OrderItemSelectorProps) => {
  const [activeCatalog, setActiveCatalog] = useState<'menu' | 'equipment'>('equipment');
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      equipmentService.getEquipmentList(),
      menuService.getMenuItems({ isAvailable: true }),
    ])
      .then(([equip, menu]) => {
        setEquipmentList(equip.filter((e) => e.isActive));
        setMenuList(menu);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredEquipment = equipmentList.filter((e) =>
    searchQuery ? e.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const filteredMenu = menuList.filter((m) =>
    searchQuery ? m.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Catalog Browser */}
      <div className="lg:col-span-2 space-y-4">
        {/* Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="join">
            <button
              type="button"
              className={`btn btn-sm join-item gap-2 ${
                activeCatalog === 'equipment' ? 'btn-active btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setActiveCatalog('equipment')}
            >
              <FaDumbbell className="size-3.5" /> Equipment ({equipmentList.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm join-item gap-2 ${
                activeCatalog === 'menu' ? 'btn-active btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setActiveCatalog('menu')}
            >
              <FaUtensils className="size-3.5" /> F&B / Menu ({menuList.length})
            </button>
          </div>

          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-2.5 size-3.5 text-base-content/40" />
            <input
              type="text"
              placeholder={`Search ${activeCatalog}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm pl-9 w-full sm:w-56 text-xs"
            />
          </div>
        </div>

        {/* Catalog Items Grid */}
        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : activeCatalog === 'equipment' ? (
          filteredEquipment.length === 0 ? (
            <div className="text-center py-12 bg-base-100 border border-base-300 rounded-xl text-xs text-base-content/60">
              No equipment found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredEquipment.map((item) => {
                const cartEntry = selectedItems.find(
                  (s) => s.itemType === 'equipment' && s.itemId === Number(item.id)
                );

                return (
                  <div
                    key={item.id}
                    className="card bg-base-100 border border-base-300 p-3 shadow-xs flex flex-row items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-12 rounded-lg object-cover border border-base-300 shrink-0"
                        />
                      ) : (
                        <div className="size-12 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40 shrink-0">
                          <FaDumbbell className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{item.name}</div>
                        <div className="text-[11px] text-base-content/60">
                          Stock: {item.stockQty} &bull; {item.category}
                        </div>
                        <div className="font-mono font-extrabold text-xs text-primary mt-0.5">
                          {formatPaise(item.pricePaise)}
                        </div>
                      </div>
                    </div>

                    <div>
                      {cartEntry ? (
                        <div className="flex items-center gap-1.5 bg-base-200 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQty('equipment', Number(item.id), -1)}
                            className="btn btn-ghost btn-xs btn-square size-6 min-h-0"
                          >
                            <FaMinus className="size-2.5" />
                          </button>
                          <span className="font-mono font-bold text-xs px-1">
                            {cartEntry.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty('equipment', Number(item.id), 1)}
                            className="btn btn-ghost btn-xs btn-square size-6 min-h-0"
                          >
                            <FaPlus className="size-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            onAddItem({
                              itemType: 'equipment',
                              itemId: Number(item.id),
                              name: item.name,
                              unitPricePaise: item.pricePaise,
                              imageUrl: item.imageUrl,
                            })
                          }
                          disabled={item.stockQty <= 0}
                          className="btn btn-primary btn-xs px-3"
                        >
                          <FaPlus className="size-2.5" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-12 bg-base-100 border border-base-300 rounded-xl text-xs text-base-content/60">
            No menu items found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredMenu.map((item) => {
              const cartEntry = selectedItems.find(
                (s) => s.itemType === 'menu' && s.itemId === Number(item.id)
              );

              return (
                <div
                  key={item.id}
                  className="card bg-base-100 border border-base-300 p-3 shadow-xs flex flex-row items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-12 rounded-lg object-cover border border-base-300 shrink-0"
                      />
                    ) : (
                      <div className="size-12 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40 shrink-0">
                        <FaUtensils className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{item.name}</div>
                      <div className="text-[11px] text-base-content/60 capitalize">
                        Stock: {item.stockQty} &bull; {item.category}
                      </div>
                      <div className="font-mono font-extrabold text-xs text-primary mt-0.5">
                        {formatPaise(item.pricePaise)}
                      </div>
                    </div>
                  </div>

                  <div>
                    {cartEntry ? (
                      <div className="flex items-center gap-1.5 bg-base-200 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQty('menu', Number(item.id), -1)}
                          className="btn btn-ghost btn-xs btn-square size-6 min-h-0"
                        >
                          <FaMinus className="size-2.5" />
                        </button>
                        <span className="font-mono font-bold text-xs px-1">
                          {cartEntry.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty('menu', Number(item.id), 1)}
                          className="btn btn-ghost btn-xs btn-square size-6 min-h-0"
                        >
                          <FaPlus className="size-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onAddItem({
                            itemType: 'menu',
                            itemId: Number(item.id),
                            name: item.name,
                            unitPricePaise: item.pricePaise,
                            imageUrl: item.imageUrl,
                          })
                        }
                        disabled={item.stockQty <= 0}
                        className="btn btn-primary btn-xs px-3"
                      >
                        <FaPlus className="size-2.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right 1 Col: Selected Order Items Cart */}
      <div className="card bg-base-100 border border-base-300 p-4 shadow-sm flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-base-300">
            <h3 className="font-bold text-xs uppercase tracking-wide flex items-center gap-2">
              <FaBoxOpen className="size-3.5 text-primary" /> Cart Line Items (
              {selectedItems.reduce((acc, curr) => acc + curr.qty, 0)})
            </h3>
          </div>

          {selectedItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-base-content/50">
              No items selected yet. Click Add from catalog.
            </div>
          ) : (
            <div className="divide-y divide-base-300 mt-2 max-h-[360px] overflow-y-auto">
              {selectedItems.map((item) => (
                <div
                  key={`${item.itemType}-${item.itemId}`}
                  className="py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs truncate">{item.name}</div>
                    <div className="text-[11px] text-base-content/60 font-mono">
                      {item.qty} &times; {formatPaise(item.unitPricePaise)} ={' '}
                      <span className="font-bold text-base-content">
                        {formatPaise(item.qty * item.unitPricePaise)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.itemType, item.itemId, -1)}
                      className="btn btn-ghost btn-xs btn-square size-5 min-h-0"
                    >
                      <FaMinus className="size-2" />
                    </button>
                    <span className="font-mono text-xs font-bold w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.itemType, item.itemId, 1)}
                      className="btn btn-ghost btn-xs btn-square size-5 min-h-0"
                    >
                      <FaPlus className="size-2" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.itemType, item.itemId)}
                      className="btn btn-ghost btn-xs btn-square size-5 min-h-0 text-error/80 hover:text-error"
                      title="Remove"
                    >
                      <FaTrash className="size-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Subtotal */}
        <div className="pt-4 border-t border-base-300 mt-4 space-y-1">
          <div className="flex justify-between text-xs text-base-content/70">
            <span>Subtotal:</span>
            <span className="font-mono font-bold">
              {formatPaise(
                selectedItems.reduce((acc, curr) => acc + curr.qty * curr.unitPricePaise, 0)
              )}
            </span>
          </div>
          <span className="text-[10px] text-base-content/50 block">
            Applicable member discounts are calculated at checkout step.
          </span>
        </div>
      </div>
    </div>
  );
};
