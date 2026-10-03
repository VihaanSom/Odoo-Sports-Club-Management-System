import {  useState, useEffect, useCallback  } from 'react';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaPlus,
  FaMagnifyingGlass,
  FaRotate,
  FaWineGlass,
  FaUtensils,
  FaCookieBite,
} from 'react-icons/fa6';

import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { canManageMenu, isMemberRole } from '@/lib/permissions';
import { menuService } from '@/services/menuService';
import type { MenuItem, CreateMenuItemPayload, UpdateMenuItemPayload } from '@/types/menu';
import { MenuItemsTable, MenuItemFormModal } from './components';

export const MenuItemsPage = () => {
  const user = useAuthStore((s) => s.user);
  const canEdit = canManageMenu(user?.role);
  const isMember = isMemberRole(user?.role);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await menuService.getMenuItems({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      });
      setItems(data);
    } catch {
      toast.error('Failed to load menu catalog');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreateOrUpdate = async (
    payload: CreateMenuItemPayload | UpdateMenuItemPayload
  ) => {
    try {
      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, payload as UpdateMenuItemPayload);
        toast.success('Menu item updated');
      } else {
        await menuService.createMenuItem(payload as CreateMenuItemPayload);
        toast.success('Menu item created');
      }
      await fetchItems();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menuService.toggleAvailability(item.id);
      toast.success(item.isAvailable ? 'Item disabled' : 'Item enabled');
      await fetchItems();
    } catch {
      toast.error('Failed to toggle availability');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Metrics
  const lowStockCount = items.filter((i) => i.stockQty <= i.lowStockThreshold).length;
  const activeCount = items.filter((i) => i.isAvailable).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              Menu & F&B Catalog
            </h1>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            {isMember
              ? 'Browse cafeteria, courtside cafe and bar offerings and pricing.'
              : 'Manage cafeteria, courtside cafe and bar offerings, pricing, and portion stocks.'}
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn btn-primary btn-sm gap-2"
          >
            <FaPlus className="size-4" /> New Menu Item
          </button>
        )}
      </div>

      {/* Snapshot Cards */}
      <div className={`grid grid-cols-2 ${isMember ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            Total Catalog
          </span>
          <div className="text-2xl font-extrabold mt-1">{items.length}</div>
          <span className="text-[11px] text-base-content/50 mt-1">Food, drinks & snacks</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            {isMember ? 'Available Today' : 'Active in POS'}
          </span>
          <div className="text-2xl font-extrabold text-success mt-1">{activeCount}</div>
          <span className="text-[11px] text-success/80 mt-1">Available for order</span>
        </div>

        {!isMember && (
          <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="text-2xl font-extrabold text-error mt-1">{lowStockCount}</div>
            <span className="text-[11px] text-error/80 mt-1">Below threshold level</span>
          </div>
        )}

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            Active Category
          </span>
          <div className="text-2xl font-extrabold text-primary mt-1 capitalize">
            {selectedCategory}
          </div>
          <span className="text-[11px] text-base-content/50 mt-1">Catalog filter view</span>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-base-300 pb-3">
        {/* Category Tabs */}
        <div className="join">
          <button
            type="button"
            className={`btn btn-sm join-item ${selectedCategory === 'all' ? 'btn-active btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-sm join-item gap-1.5 ${selectedCategory === 'beverage' ? 'btn-active btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedCategory('beverage')}
          >
            <FaWineGlass className="size-3" /> Beverages
          </button>
          <button
            type="button"
            className={`btn btn-sm join-item gap-1.5 ${selectedCategory === 'food' ? 'btn-active btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedCategory('food')}
          >
            <FaUtensils className="size-3" /> Food
          </button>
          <button
            type="button"
            className={`btn btn-sm join-item gap-1.5 ${selectedCategory === 'snack' ? 'btn-active btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedCategory('snack')}
          >
            <FaCookieBite className="size-3" /> Snacks
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-2.5 size-3.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm pl-9 w-48 sm:w-64 text-xs"
            />
          </div>

          <button
            type="button"
            onClick={fetchItems}
            disabled={loading}
            className="btn btn-ghost btn-xs gap-1"
          >
            <FaRotate className={`size-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : (
        <MenuItemsTable
          items={items}
          canEdit={canEdit}
          onEdit={handleOpenEditModal}
          onToggleAvailability={handleToggleAvailability}
        />
      )}

      {/* Form Modal */}
      {canEdit && (
        <MenuItemFormModal
          isOpen={isModalOpen}
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
        />
      )}
    </motion.div>
  );
};

export default MenuItemsPage;
