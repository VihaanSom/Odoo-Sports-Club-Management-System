import {  useState, useEffect, useCallback  } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaArrowLeft,
  FaPenToSquare,
  FaTriangleExclamation,
  FaUtensils,
  FaCheck,
  FaBan,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { canManageMenu, isMemberRole } from '@/lib/permissions';
import { menuService } from '@/services/menuService';
import { formatPaise } from '@/lib/utils';
import type { MenuItem, UpdateMenuItemPayload } from '@/types/menu';
import { MenuItemFormModal } from './components';

export const MenuItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const canManage = canManageMenu(user?.role);
  const isMember = isMemberRole(user?.role);

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await menuService.getMenuItemById(id);
      setItem(data);
    } catch {
      toast.error('Failed to load menu item');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleUpdate = async (payload: UpdateMenuItemPayload) => {
    if (!item) return;
    try {
      await menuService.updateMenuItem(item.id, payload);
      toast.success('Item updated');
      await fetchItem();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleToggle = async () => {
    if (!item) return;
    try {
      await menuService.toggleAvailability(item.id);
      toast.success(item.isAvailable ? 'Disabled item' : 'Enabled item');
      await fetchItem();
    } catch {
      toast.error('Failed to toggle availability');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20 bg-base-100 border border-base-300 rounded-2xl max-w-lg mx-auto">
        <FaUtensils className="size-12 mx-auto text-base-content/40 mb-3" />
        <h2 className="text-lg font-bold">Item Not Found</h2>
        <p className="text-xs text-base-content/60 mt-1">The requested menu item does not exist.</p>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="btn btn-primary btn-sm mt-4"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const isLowStock = item.stockQty <= item.lowStockThreshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/menu" className="btn btn-ghost btn-xs btn-circle" title="Back to menu">
              <FaArrowLeft className="size-3.5" />
            </Link>
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              {item.name}
            </h1>
            <span className="badge badge-sm badge-outline uppercase font-semibold text-xs">
              {item.category}
            </span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            Item ID #{item.id} &bull; Added {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/menu" className="btn btn-outline btn-sm">
            Back
          </Link>
          {canManage && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-primary btn-sm gap-1.5"
            >
              <FaPenToSquare className="size-3" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden md:col-span-1">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-base-200 flex flex-col items-center justify-center text-base-content/40">
              <FaUtensils className="size-12 mb-2" />
              <span className="text-xs font-semibold">No Image Uploaded</span>
            </div>
          )}

          <div className="p-4 border-t border-base-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-base-content/70">Availability</span>
              {canManage ? (
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`btn btn-xs gap-1 ${
                    item.isAvailable ? 'btn-success text-white' : 'btn-ghost text-base-content/60'
                  }`}
                >
                  {item.isAvailable ? (
                    <>
                      <FaCheck className="size-2.5" /> Active in POS
                    </>
                  ) : (
                    <>
                      <FaBan className="size-2.5" /> Inactive
                    </>
                  )}
                </button>
              ) : (
                item.isAvailable ? (
                  <span className="badge badge-success text-white badge-xs gap-1 font-bold">
                    <FaCheck className="size-2.5" /> Available
                  </span>
                ) : (
                  <span className="badge badge-ghost badge-xs gap-1">
                    <FaBan className="size-2.5" /> Sold Out
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Specs & Pricing */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 md:col-span-2 space-y-6">
          {/* Price & Stock Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-base-200/60 border border-base-300">
            <div>
              <span className="text-xs font-semibold text-base-content/60 uppercase">
                Selling Price
              </span>
              <div className="text-3xl font-extrabold text-primary font-mono mt-0.5">
                {formatPaise(item.pricePaise)}
              </div>
            </div>

            <div>
              {canManage ? (
                <>
                  <span className="text-xs font-semibold text-base-content/60 uppercase">
                    Stock On Hand
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold font-mono">{item.stockQty}</span>
                    {isLowStock && (
                      <span className="badge badge-error badge-sm gap-1 font-bold">
                        <FaTriangleExclamation className="size-3" /> Low Stock
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-base-content/50">
                    Threshold: {item.lowStockThreshold} units
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-semibold text-base-content/60 uppercase">
                    Service Status
                  </span>
                  <div className="mt-1">
                    {item.isAvailable && item.stockQty > 0 ? (
                      <span className="badge badge-success text-white font-semibold">
                        Ready to Order
                      </span>
                    ) : (
                      <span className="badge badge-ghost text-base-content/60 font-semibold">
                        Sold Out Today
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-base-content/50 block mt-1">
                    Order courtside or at cafe bar counter
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-xs font-bold text-base-content/70 uppercase tracking-wider mb-2">
              Description & Preparation
            </h3>
            <p className="text-sm text-base-content/80 leading-relaxed bg-base-200/30 p-4 rounded-xl border border-base-300">
              {item.description || 'No description provided for this catalog entry.'}
            </p>
          </div>

          {/* Metadata Table */}
          <div className="overflow-x-auto border border-base-300 rounded-xl">
            <table className="table table-sm text-xs">
              <tbody>
                <tr className="border-b border-base-300">
                  <td className="font-semibold text-base-content/60 w-40">Item ID</td>
                  <td className="font-mono">#{item.id}</td>
                </tr>
                <tr className="border-b border-base-300">
                  <td className="font-semibold text-base-content/60">Category</td>
                  <td className="capitalize">{item.category}</td>
                </tr>
                {canManage && (
                  <>
                    <tr className="border-b border-base-300">
                      <td className="font-semibold text-base-content/60">Paise Stored Value</td>
                      <td className="font-mono">{item.pricePaise} paise</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-base-content/60">POS Availability</td>
                      <td>
                        {item.isAvailable ? (
                          <span className="text-success font-semibold">Enabled</span>
                        ) : (
                          <span className="text-error font-semibold">Disabled</span>
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {!canManage && (
            <div className="card bg-base-200/40 border border-base-300 p-4 space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wide text-primary">
                Cafe & Courtside Dining
              </h4>
              <p className="text-xs text-base-content/70">
                Orders can be placed with staff at the club cafe, lounge tables, or courtside service. Mention your membership number for applicable member tier discounts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal (Staff only) */}
      {canManage && (
        <MenuItemFormModal
          isOpen={isEditModalOpen}
          item={item}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdate}
        />
      )}
    </motion.div>
  );
};

export default MenuItemDetailPage;
