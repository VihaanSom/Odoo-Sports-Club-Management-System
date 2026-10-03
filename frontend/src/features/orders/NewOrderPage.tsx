import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaArrowLeft,
  FaArrowRight,
  FaCreditCard,
  FaMobileScreenButton,
  FaMoneyBillWave,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';
import { mockMembers } from '@/mock/members';
import { formatPaise } from '@/lib/utils';
import type { OrderType } from '@/types/orders';
import { OrderItemSelector, type SelectedOrderItem } from './components/OrderItemSelector';

const newOrderSchema = z.object({
  orderType: z.enum(['in_store', 'online', 'bar'] as const),
  memberId: z.string().optional(),
  paymentMethod: z.enum(['card', 'upi', 'cash', 'plan'] as const),
  deliveryAddress: z.string().max(250).optional(),
  notes: z.string().max(250).optional(),
});

type NewOrderFormData = z.infer<typeof newOrderSchema>;

export const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<NewOrderFormData>({
    resolver: zodResolver(newOrderSchema),
    mode: 'onTouched',
    defaultValues: {
      orderType: 'in_store',
      memberId: '',
      paymentMethod: 'card',
      deliveryAddress: '',
      notes: '',
    },
  });

  const orderType = watch('orderType');
  const selectedMemberId = watch('memberId');


  const selectedMember = selectedMemberId
    ? mockMembers.find((m) => m.id.replace(/\D/g, '') === selectedMemberId || m.id === selectedMemberId)
    : null;

  // Cart operations
  const handleAddItem = (item: {
    itemType: 'equipment' | 'menu';
    itemId: number;
    name: string;
    unitPricePaise: number;
    imageUrl?: string | null;
  }) => {
    setSelectedItems((prev) => {
      const existing = prev.find(
        (i) => i.itemType === item.itemType && i.itemId === item.itemId
      );
      if (existing) {
        return prev.map((i) =>
          i.itemType === item.itemType && i.itemId === item.itemId
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleUpdateQty = (
    itemType: 'equipment' | 'menu',
    itemId: number,
    delta: number
  ) => {
    setSelectedItems((prev) =>
      prev
        .map((i) => {
          if (i.itemType === itemType && i.itemId === itemId) {
            const nextQty = i.qty + delta;
            return nextQty > 0 ? { ...i, qty: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as SelectedOrderItem[]
    );
  };

  const handleRemoveItem = (itemType: 'equipment' | 'menu', itemId: number) => {
    setSelectedItems((prev) =>
      prev.filter((i) => !(i.itemType === itemType && i.itemId === itemId))
    );
  };

  // Financial calculations
  const subtotalPaise = selectedItems.reduce(
    (sum, item) => sum + item.qty * item.unitPricePaise,
    0
  );

  const discountRate =
    selectedMember?.membershipPlan === 'VIP'
      ? 0.1
      : selectedMember?.membershipPlan === 'Premium'
      ? 0.05
      : 0;

  const discountPaise = Math.round(subtotalPaise * discountRate);
  const totalPaise = subtotalPaise - discountPaise;

  const onSubmitOrder = async (values: NewOrderFormData) => {
    if (selectedItems.length === 0) {
      toast.error('Add at least one item to cart');
      setStep(2);
      return;
    }

    try {
      const order = await orderService.createOrder({
        memberId: values.memberId ? Number(values.memberId) : null,
        orderType: values.orderType as OrderType,
        paymentMethod: values.paymentMethod,
        deliveryAddress: values.deliveryAddress || undefined,
        notes: values.notes || undefined,
        items: selectedItems.map((i) => ({
          itemType: i.itemType,
          itemId: i.itemId,
          name: i.name,
          qty: i.qty,
          unitPricePaise: i.unitPricePaise,
          imageUrl: i.imageUrl || undefined,
        })),
        discountPaise,
      });

      toast.success(`Order ${order.orderNumber} created`);
      navigate(`/orders/${order.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Order creation failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/orders" className="btn btn-ghost btn-xs btn-circle" title="Back to orders">
              <FaArrowLeft className="size-3.5" />
            </Link>
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              New POS Order
            </h1>
          </div>
          <p className="text-xs text-base-content/70 mt-1">
            Create in-store, online, or bar order for equipment retail and food & beverage.
          </p>
        </div>

        <Link to="/orders" className="btn btn-outline btn-sm">
          Back
        </Link>
      </div>

      {/* Stepper Wizard Indicator */}
      <ul className="steps steps-horizontal w-full bg-base-100 border border-base-300 py-3 rounded-xl shadow-xs">
        <li className={`step ${step >= 1 ? 'step-primary font-bold text-xs' : 'text-xs'}`}>
          1. Order Setup
        </li>
        <li className={`step ${step >= 2 ? 'step-primary font-bold text-xs' : 'text-xs'}`}>
          2. Items Catalog
        </li>
        <li className={`step ${step >= 3 ? 'step-primary font-bold text-xs' : 'text-xs'}`}>
          3. Payment & Settle
        </li>
      </ul>

      <form onSubmit={handleSubmit(onSubmitOrder)} className="space-y-6">
        {/* STEP 1: Order Setup */}
        {step === 1 && (
          <div className="card bg-base-100 border border-base-300 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
              Step 1: Order Destination & Customer
            </h2>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Order Type <span className="text-error">*</span>
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-base-300 cursor-pointer hover:bg-base-200">
                  <input
                    type="radio"
                    value="in_store"
                    className="radio radio-primary radio-sm"
                    {...register('orderType')}
                  />
                  <div>
                    <div className="font-bold text-xs">In-Store / Front Desk</div>
                    <div className="text-[11px] text-base-content/60">Over-the-counter retail</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-base-300 cursor-pointer hover:bg-base-200">
                  <input
                    type="radio"
                    value="online"
                    className="radio radio-primary radio-sm"
                    {...register('orderType')}
                  />
                  <div>
                    <div className="font-bold text-xs">Online Delivery</div>
                    <div className="text-[11px] text-base-content/60">Delivered to residence</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-base-300 cursor-pointer hover:bg-base-200">
                  <input
                    type="radio"
                    value="bar"
                    className="radio radio-primary radio-sm"
                    {...register('orderType')}
                  />
                  <div>
                    <div className="font-bold text-xs">Bar / Quick Snack</div>
                    <div className="text-[11px] text-base-content/60">Cafeteria takeout</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wide">
                  Customer / Member Account (Optional)
                </span>
              </label>
              <select
                className="select select-bordered w-full text-sm"
                {...register('memberId')}
              >
                <option value="">Walk-in Customer (No Member Perks)</option>
                {mockMembers.map((m) => (
                  <option key={m.id} value={m.id.replace(/\D/g, '') || m.id}>
                    {m.name} &bull; {m.membershipPlan} ({m.email})
                  </option>
                ))}
              </select>
              <span className="text-base-content/60 text-xs mt-1">
                VIP members receive 10% discount; Premium receives 5%.
              </span>
            </div>

            {orderType === 'online' && (
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs uppercase tracking-wide">
                    Delivery Address <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Apartment, Street, City, Pincode"
                  className="input input-bordered w-full text-sm"
                  {...register('deliveryAddress')}
                />
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-base-300">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-primary btn-sm px-6 gap-2"
              >
                Next <FaArrowRight className="size-3" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Items Catalog */}
        {step === 2 && (
          <div className="space-y-4">
            <OrderItemSelector
              selectedItems={selectedItems}
              onAddItem={handleAddItem}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={handleRemoveItem}
            />

            <div className="flex justify-between items-center pt-4 border-t border-base-300 bg-base-100 p-4 rounded-xl border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-ghost btn-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedItems.length === 0) {
                    toast.error('Please add at least one item');
                    return;
                  }
                  setStep(3);
                }}
                className="btn btn-primary btn-sm px-6 gap-2"
              >
                Next <FaArrowRight className="size-3" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment & Review */}
        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Payment method & order review */}
            <div className="card bg-base-100 border border-base-300 p-6 shadow-sm md:col-span-2 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
                Step 3: Select Payment & Review
              </h2>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs uppercase tracking-wide">
                    Payment Method <span className="text-error">*</span>
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-base-300 cursor-pointer hover:bg-base-200 text-xs font-semibold">
                    <input
                      type="radio"
                      value="card"
                      className="radio radio-primary radio-xs"
                      {...register('paymentMethod')}
                    />
                    <FaCreditCard className="size-3 text-primary" /> Credit/Debit Card
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-base-300 cursor-pointer hover:bg-base-200 text-xs font-semibold">
                    <input
                      type="radio"
                      value="upi"
                      className="radio radio-primary radio-xs"
                      {...register('paymentMethod')}
                    />
                    <FaMobileScreenButton className="size-3 text-success" /> UPI QR
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-base-300 cursor-pointer hover:bg-base-200 text-xs font-semibold">
                    <input
                      type="radio"
                      value="cash"
                      className="radio radio-primary radio-xs"
                      {...register('paymentMethod')}
                    />
                    <FaMoneyBillWave className="size-3 text-warning" /> Cash at Register
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-base-300 cursor-pointer hover:bg-base-200 text-xs font-semibold">
                    <input
                      type="radio"
                      value="plan"
                      className="radio radio-primary radio-xs"
                      {...register('paymentMethod')}
                    />
                    <FaTrophy className="size-3 text-amber-500" /> Member Account
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs uppercase tracking-wide">
                    Internal Order Notes
                  </span>
                </label>
                <textarea
                  placeholder="e.g. Specific string tension, customer pickup note..."
                  className="textarea textarea-bordered w-full text-xs h-20"
                  {...register('notes')}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-base-300">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-ghost btn-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedItems.length === 0}
                  className="btn btn-primary btn-sm px-6"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>

            {/* Right 1 Col: Summary Box */}
            <div className="card bg-base-100 border border-base-300 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-base-content/70 pb-2 border-b border-base-300">
                Order Summary
              </h3>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Type:</span>
                  <span className="font-bold capitalize">{orderType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Customer:</span>
                  <span className="font-bold">{selectedMember?.name || 'Walk-in'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Total Items:</span>
                  <span className="font-mono font-bold">
                    {selectedItems.reduce((acc, curr) => acc + curr.qty, 0)}
                  </span>
                </div>
              </div>

              <div className="divider my-1" />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Subtotal:</span>
                  <span className="font-mono font-medium">{formatPaise(subtotalPaise)}</span>
                </div>

                {discountPaise > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({selectedMember?.membershipPlan}):</span>
                    <span className="font-mono">- {formatPaise(discountPaise)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-base-content pt-2 border-t border-base-300">
                  <span>Total Amount:</span>
                  <span className="text-primary font-mono">{formatPaise(totalPaise)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default NewOrderPage;
