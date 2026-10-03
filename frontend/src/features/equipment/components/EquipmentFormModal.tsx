import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrophy, FaXmark } from 'react-icons/fa6';
import type {
  EquipmentItem,
  CreateEquipmentPayload,
  UpdateEquipmentPayload,
} from '@/types/equipment';
import { EquipmentImageUpload } from './EquipmentImageUpload';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name required').max(100, 'Max 100 characters'),
  category: z.string().min(1, 'Category required'),
  brand: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  priceRupees: z.coerce
    .number({ invalid_type_error: 'Price required' })
    .min(0, 'Price cannot be negative'),
  stockQty: z.coerce
    .number({ invalid_type_error: 'Stock required' })
    .min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce
    .number({ invalid_type_error: 'Threshold required' })
    .min(1, 'Min 1'),
  condition: z.string().optional(),
  rentalRateRupees: z.coerce.number().min(0).optional(),
  isActive: z.boolean(),
  imageUrl: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentFormModalProps {
  isOpen: boolean;
  item?: EquipmentItem | null;
  onClose: () => void;
  onSubmit: (payload: CreateEquipmentPayload | UpdateEquipmentPayload) => Promise<void>;
}

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  isOpen,
  item,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(item);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      category: 'racket',
      brand: '',
      description: '',
      priceRupees: undefined,
      stockQty: undefined,
      lowStockThreshold: 5,
      condition: 'Excellent',
      rentalRateRupees: 0,
      isActive: true,
      imageUrl: '',
    },
  });

  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          name: item.name,
          category: item.category,
          brand: item.brand || '',
          description: item.description || '',
          priceRupees: item.pricePaise / 100,
          stockQty: item.stockQty,
          lowStockThreshold: item.lowStockThreshold,
          condition: item.condition || 'Excellent',
          rentalRateRupees: (item.rentalRatePaise || 0) / 100,
          isActive: item.isActive,
          imageUrl: item.imageUrl || '',
        });
      } else {
        reset({
          name: '',
          category: 'racket',
          brand: '',
          description: '',
          priceRupees: undefined,
          stockQty: undefined,
          lowStockThreshold: 5,
          condition: 'Excellent',
          rentalRateRupees: 0,
          isActive: true,
          imageUrl: '',
        });
      }
    }
  }, [isOpen, item, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: EquipmentFormData) => {
    const payload = {
      name: values.name,
      category: values.category,
      brand: values.brand || undefined,
      description: values.description || undefined,
      pricePaise: Math.round(Number(values.priceRupees) * 100),
      stockQty: Number(values.stockQty),
      lowStockThreshold: Number(values.lowStockThreshold),
      condition: values.condition || 'Excellent',
      rentalRatePaise: Math.round(Number(values.rentalRateRupees || 0) * 100),
      isActive: values.isActive,
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
              {isEdit ? 'Edit Equipment' : 'New Equipment Item'}
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
                Product Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wilson Pro Staff 97 v14"
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
                <option value="racket">Racket</option>
                <option value="ball">Ball</option>
                <option value="shoe">Shoe</option>
                <option value="accessory">Accessory</option>
                <option value="apparel">Apparel</option>
              </select>
              {errors.category && (
                <span className="text-error text-xs mt-1">{errors.category.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Brand
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Wilson, Babolat"
                className="input input-bordered w-full text-sm"
                {...register('brand')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Retail Price (₹ INR) <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="24999"
                className={`input input-bordered w-full text-sm font-mono ${
                  errors.priceRupees ? 'input-error' : ''
                }`}
                {...register('priceRupees')}
              />
              {errors.priceRupees && (
                <span className="text-error text-xs mt-1">{errors.priceRupees.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Rental Rate (₹ / session)
                </span>
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="800"
                className="input input-bordered w-full text-sm font-mono"
                {...register('rentalRateRupees')}
              />
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
                placeholder="15"
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
              placeholder="Technical specs, weight, grip size, recommended player profile..."
              className="textarea textarea-bordered w-full text-sm h-18"
              {...register('description')}
            />
          </div>

          {/* Image Upload Component */}
          <EquipmentImageUpload
            value={imageUrl}
            onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
          />

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3 py-1">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                {...register('isActive')}
              />
              <span className="label-text font-medium text-sm">
                Active in Store Catalog
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
