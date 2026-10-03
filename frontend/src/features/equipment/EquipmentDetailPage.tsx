import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaArrowLeft,
  FaPenToSquare,
  FaDumbbell,
  FaTriangleExclamation,
  FaBoxesStacked,
  FaPlus,
  FaMinus,
  FaCheck,
  FaBan,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { equipmentService } from '@/services/equipmentService';
import { formatPaise } from '@/lib/utils';
import type { EquipmentItem, UpdateEquipmentPayload } from '@/types/equipment';
import { EquipmentFormModal } from './components';

export const EquipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<EquipmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Stock adjustment state
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Restock / inventory audit');
  const [adjusting, setAdjusting] = useState<boolean>(false);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await equipmentService.getEquipmentById(id);
      setItem(data);
    } catch {
      toast.error('Failed to load equipment item');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleUpdate = async (payload: UpdateEquipmentPayload) => {
    if (!item) return;
    try {
      await equipmentService.updateEquipment(item.id, payload);
      toast.success('Equipment updated');
      await fetchItem();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleAdjustStock = async (delta: number) => {
    if (!item) return;
    setAdjusting(true);
    try {
      await equipmentService.adjustStock(item.id, {
        adjustmentQty: delta,
        reason: adjustReason,
      });
      toast.success(`Adjusted stock by ${delta > 0 ? `+${delta}` : delta}`);
      await fetchItem();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Stock adjustment failed');
    } finally {
      setAdjusting(false);
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
        <FaDumbbell className="size-12 mx-auto text-base-content/40 mb-3" />
        <h2 className="text-lg font-bold">Equipment Not Found</h2>
        <p className="text-xs text-base-content/60 mt-1">
          The requested equipment gear does not exist.
        </p>
        <button
          type="button"
          onClick={() => navigate('/equipment')}
          className="btn btn-primary btn-sm mt-4"
        >
          Back to Equipment
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
            <Link to="/equipment" className="btn btn-ghost btn-xs btn-circle" title="Back to equipment">
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
            Product ID #{item.id} &bull; Brand: {item.brand || 'Club Standard'} &bull; Condition:{' '}
            {item.condition || 'Excellent'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/equipment" className="btn btn-outline btn-sm">
            Back
          </Link>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-primary btn-sm gap-1.5"
          >
            <FaPenToSquare className="size-3" /> Edit
          </button>
        </div>
      </div>

      {/* Main Grid */}
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
              <FaDumbbell className="size-12 mb-2" />
              <span className="text-xs font-semibold">No Image Uploaded</span>
            </div>
          )}

          <div className="p-4 border-t border-base-300 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-content/70">Store Status</span>
              {item.isActive ? (
                <span className="badge badge-success text-white badge-xs gap-1 font-bold">
                  <FaCheck className="size-2.5" /> Active
                </span>
              ) : (
                <span className="badge badge-ghost badge-xs gap-1">
                  <FaBan className="size-2.5" /> Inactive
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-base-content/70">Equipment Condition</span>
              <span className="font-semibold">{item.condition || 'Excellent'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Stock, Adjustment */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 md:col-span-2 space-y-6">
          {/* Price & Stock Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-base-200/60 border border-base-300">
            <div>
              <span className="text-xs font-semibold text-base-content/60 uppercase">
                Retail Price
              </span>
              <div className="text-3xl font-extrabold text-primary font-mono mt-0.5">
                {formatPaise(item.pricePaise)}
              </div>
              {item.rentalRatePaise ? (
                <span className="text-[11px] text-base-content/70">
                  Rental rate: {formatPaise(item.rentalRatePaise)} / session
                </span>
              ) : null}
            </div>

            <div>
              <span className="text-xs font-semibold text-base-content/60 uppercase">
                Available Stock
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl font-extrabold font-mono">{item.stockQty}</span>
                {isLowStock && (
                  <span className="badge badge-error badge-sm gap-1 font-bold">
                    <FaTriangleExclamation className="size-3" /> Low Stock
                  </span>
                )}
              </div>
              <span className="text-[11px] text-base-content/50">
                Low-stock threshold: {item.lowStockThreshold} units
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-base-content/70 uppercase tracking-wider mb-2">
              Product Specifications & Overview
            </h3>
            <p className="text-sm text-base-content/80 leading-relaxed bg-base-200/30 p-4 rounded-xl border border-base-300">
              {item.description || 'No technical description available.'}
            </p>
          </div>

          {/* Stock Adjustment Controls */}
          <div className="card bg-base-200/50 border border-base-300 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FaBoxesStacked className="size-4 text-primary" />
              <h3 className="font-bold text-xs uppercase tracking-wide">
                Adjust Inventory Stock (IV-01)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="form-control">
                <label className="label py-0.5">
                  <span className="label-text text-[11px] font-semibold">Quantity Delta</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                  className="input input-bordered input-sm text-xs font-mono"
                />
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label py-0.5">
                  <span className="label-text text-[11px] font-semibold">Reason for Adjustment</span>
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="input input-bordered input-sm text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={adjusting || item.stockQty <= 0}
                onClick={() => handleAdjustStock(-adjustQty)}
                className="btn btn-error text-white btn-sm gap-1"
              >
                <FaMinus className="size-2.5" /> Deduct {adjustQty}
              </button>
              <button
                type="button"
                disabled={adjusting}
                onClick={() => handleAdjustStock(adjustQty)}
                className="btn btn-success text-white btn-sm gap-1"
              >
                <FaPlus className="size-2.5" /> Restock +{adjustQty}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EquipmentFormModal
        isOpen={isEditModalOpen}
        item={item}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
      />
    </motion.div>
  );
};

export default EquipmentDetailPage;
