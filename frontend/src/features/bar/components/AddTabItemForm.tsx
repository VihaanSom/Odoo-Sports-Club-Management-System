import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrophy, FaXmark, FaPlus, FaMinus } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { menuService } from '@/services/menuService';
import { barService } from '@/services/barService';
import { formatPaise } from '@/lib/utils';
import type { MenuItem } from '@/types/menu';

const addTabItemSchema = z.object({
  menuItemId: z.coerce.number({ invalid_type_error: 'Item required' }).min(1, 'Select a menu item'),
  qty: z.coerce.number({ invalid_type_error: 'Qty required' }).min(1, 'Minimum 1').max(25, 'Max 25 per entry'),
});

type AddTabItemFormData = z.infer<typeof addTabItemSchema>;

interface AddTabItemFormProps {
  isOpen: boolean;
  tabId: number;
  onClose: () => void;
  onItemAdded: () => Promise<void>;
}

export const AddTabItemForm: React.FC<AddTabItemFormProps> = ({
  isOpen,
  tabId,
  onClose,
  onItemAdded,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTabItemFormData>({
    resolver: zodResolver(addTabItemSchema),
    mode: 'onTouched',
    defaultValues: {
      menuItemId: undefined,
      qty: 1,
    },
  });

  const selectedItemId = watch('menuItemId');
  const qty = watch('qty') || 1;
  const selectedItem = menuItems.find((m) => m.id === Number(selectedItemId));

  useEffect(() => {
    if (isOpen) {
      reset({
        menuItemId: undefined,
        qty: 1,
      });
      setLoading(true);
      menuService
        .getMenuItems({ isAvailable: true })
        .then((items) => setMenuItems(items))
        .catch(() => toast.error('Failed to load menu items'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: AddTabItemFormData) => {
    try {
      await barService.addItemToTab(tabId, {
        menuItemId: Number(values.menuItemId),
        qty: Number(values.qty),
      });
      toast.success('Item added to tab');
      await onItemAdded();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-md">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <div className="flex items-center gap-2">
            <FaTrophy className="size-5 text-amber-500" />
            <h3 className="font-bold text-lg text-base-content">Add Item to Tab</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60"
            aria-label="Close"
          >
            <FaXmark className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Menu Item <span className="text-error">*</span>
              </span>
            </label>
            <select
              disabled={loading}
              className={`select select-bordered w-full text-sm ${
                errors.menuItemId ? 'select-error' : ''
              }`}
              {...register('menuItemId')}
            >
              <option value="">Select menu item...</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {formatPaise(item.pricePaise)} ({item.category})
                </option>
              ))}
            </select>
            {errors.menuItemId && (
              <span className="text-error text-xs mt-1">{errors.menuItemId.message}</span>
            )}
          </div>

          {selectedItem && (
            <>
              <div className="grid grid-cols-2 gap-3 items-start">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs uppercase tracking-wide">
                      Quantity <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input type="hidden" {...register('qty')} value={qty} />
                    <button
                      type="button"
                      onClick={() => setValue('qty', Math.max(1, qty - 1), { shouldValidate: true })}
                      disabled={qty <= 1}
                      className="btn btn-outline btn-sm btn-square"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus className="size-3" />
                    </button>

                    <div
                      className="flex-1 py-1.5 border border-base-300 rounded-lg text-center font-mono font-bold text-sm bg-base-200 select-none cursor-default"
                      aria-label="Quantity"
                    >
                      {qty}
                    </div>

                    <button
                      type="button"
                      onClick={() => setValue('qty', Math.min(25, qty + 1), { shouldValidate: true })}
                      disabled={qty >= 25}
                      className="btn btn-outline btn-sm btn-square"
                      aria-label="Increase quantity"
                    >
                      <FaPlus className="size-3" />
                    </button>
                  </div>
                  {errors.qty && (
                    <span className="text-error text-xs mt-1">{errors.qty.message}</span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs uppercase tracking-wide">
                      Unit Price
                    </span>
                  </label>
                  <div className="h-8.5 px-3 bg-base-200 border border-base-300 rounded-lg flex items-center text-sm mt-0.5">
                    <span className="font-mono font-bold text-base-content text-xs">
                      {formatPaise(selectedItem.pricePaise)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-base-200/60 border border-base-300 rounded-lg text-xs flex justify-between items-center">
                <span className="font-semibold text-base-content/70">Subtotal ({qty} portions):</span>
                <span className="font-mono font-bold text-primary text-sm">
                  {formatPaise(selectedItem.pricePaise * qty)}
                </span>
              </div>
            </>
          )}


          <div className="modal-action pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm px-6"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
};
