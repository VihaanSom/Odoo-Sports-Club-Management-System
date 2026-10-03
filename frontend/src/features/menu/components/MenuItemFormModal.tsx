import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrophy, FaXmark } from 'react-icons/fa6';
import type { MenuItem, CreateMenuItemPayload, UpdateMenuItemPayload, MenuCategoryType } from '@/types/menu';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name required').max(100, 'Max 100 characters'),
  category: z.enum(['food', 'beverage', 'snack'] as const, {
    required_error: 'Category required',
  }),
  description: z.string().max(300, 'Max 300 characters').optional(),
  priceRupees: z.coerce
    .number({ invalid_type_error: 'Price required' })
    .min(1, 'Price must be greater than 0'),
  stockQty: z.coerce
    .number({ invalid_type_error: 'Stock required' })
    .min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce
    .number({ invalid_type_error: 'Threshold required' })
    .min(1, 'Threshold must be at least 1'),
  isAvailable: z.boolean(),
  imageUrl: z.string().url('Must be valid URL').or(z.literal('')).optional(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormModalProps {
  isOpen: boolean;
  item?: MenuItem | null;
  onClose: () => void;
  onSubmit: (payload: CreateMenuItemPayload | UpdateMenuItemPayload) => Promise<void>;
}

export const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  isOpen,
  item,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(item);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      category: 'beverage',
      description: '',
      priceRupees: undefined,
      stockQty: undefined,
      lowStockThreshold: 5,
      isAvailable: true,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          name: item.name,
          category: (item.category as MenuCategoryType) || 'beverage',
          description: item.description || '',
          priceRupees: item.pricePaise / 100,
          stockQty: item.stockQty,
          lowStockThreshold: item.lowStockThreshold,
          isAvailable: item.isAvailable,
          imageUrl: item.imageUrl || '',
        });
      } else {
        reset({
          name: '',
          category: 'beverage',
          description: '',
          priceRupees: undefined,
          stockQty: undefined,
          lowStockThreshold: 5,
          isAvailable: true,
          imageUrl: '',
        });
      }
    }
  }, [isOpen, item, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: MenuItemFormData) => {
    const payload = {
      name: values.name,
      category: values.category,
      description: values.description || undefined,
      pricePaise: Math.round(Number(values.priceRupees) * 100),
      stockQty: Number(values.stockQty),
      lowStockThreshold: Number(values.lowStockThreshold),
      isAvailable: values.isAvailable,
      imageUrl: values.imageUrl || undefined,
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-lg">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <div className="flex items-center gap-2">
            <FaTrophy className="size-5 text-amber-500" />
            <h3 className="font-bold text-lg text-base-content">
              {isEdit ? 'Edit Menu Item' : 'New Menu Item'}
            </h3>
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
                Item Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cold Brew Oat Latte"
              className={`input input-bordered w-full text-sm ${
                errors.name ? 'input-error' : ''
              }`}
              {...register('name')}
            />
            {errors.name && (
              <span className="text-error text-xs mt-1">{errors.name.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Category <span className="text-error">*</span>
                </span>
              </label>
              <select
                className={`select select-bordered w-full text-sm capitalize ${
                  errors.category ? 'select-error' : ''
                }`}
                {...register('category')}
              >
                <option value="beverage">Beverage</option>
                <option value="food">Food</option>
                <option value="snack">Snack</option>
              </select>
              {errors.category && (
                <span className="text-error text-xs mt-1">{errors.category.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Price (₹ INR) <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="250"
                className={`input input-bordered w-full text-sm font-mono ${
                  errors.priceRupees ? 'input-error' : ''
                }`}
                {...register('priceRupees')}
              />
              {errors.priceRupees && (
                <span className="text-error text-xs mt-1">{errors.priceRupees.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Stock Units <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                min={0}
                placeholder="30"
                className={`input input-bordered w-full text-sm ${
                  errors.stockQty ? 'input-error' : ''
                }`}
                {...register('stockQty')}
              />
              {errors.stockQty && (
                <span className="text-error text-xs mt-1">{errors.stockQty.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Low Stock Threshold <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                min={1}
                placeholder="5"
                className={`input input-bordered w-full text-sm ${
                  errors.lowStockThreshold ? 'input-error' : ''
                }`}
                {...register('lowStockThreshold')}
              />
              {errors.lowStockThreshold && (
                <span className="text-error text-xs mt-1">
                  {errors.lowStockThreshold.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Description
              </span>
            </label>
            <textarea
              placeholder="Key ingredients, prep notes, dietary allergens..."
              className="textarea textarea-bordered w-full text-sm h-18"
              {...register('description')}
            />
            {errors.description && (
              <span className="text-error text-xs mt-1">{errors.description.message}</span>
            )}
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Image URL
              </span>
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              className={`input input-bordered w-full text-sm ${
                errors.imageUrl ? 'input-error' : ''
              }`}
              {...register('imageUrl')}
            />
            {errors.imageUrl && (
              <span className="text-error text-xs mt-1">{errors.imageUrl.message}</span>
            )}
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3 py-1">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                {...register('isAvailable')}
              />
              <span className="label-text font-medium text-sm">
                Active in POS & Cafeteria Menu
              </span>
            </label>
          </div>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : isEdit ? (
                'Save'
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
