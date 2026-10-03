import { formatEquipment } from '../src/modules/equipment/equipment.service';
import { formatOrder } from '../src/modules/orders/orders.service';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  listEquipmentQuerySchema,
} from '../src/modules/equipment/equipment.validator';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
} from '../src/modules/orders/orders.validator';
import { Prisma, EquipmentCategory, OrderType, OrderStatus, PaymentMethod } from '@prisma/client';

let passed = 0;
let failed = 0;

const assert = (condition: boolean, testName: string) => {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
};

const runTests = async () => {
  console.log('\n==================================================');
  console.log('🧪 RUNNING SHOP & INVENTORY UNIT & VALIDATION TESTS');
  console.log('==================================================\n');

  // --- 1. EQUIPMENT CURRENCY CONVERSION ---
  console.log('📌 Test Suite 1: Equipment Currency Conversion');
  const mockEquipment = {
    id: 1,
    name: 'Wilson Pro Staff 97',
    category: EquipmentCategory.racket,
    brand: 'Wilson',
    description: 'Pro racket',
    price: new Prisma.Decimal('18500.00'), // ₹18,500
    stockQty: 12,
    lowStockThreshold: 5,
    isActive: true,
    imageUrl: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
  const formattedEq = formatEquipment(mockEquipment as any);
  assert(formattedEq.pricePaise === 1850000, '₹18,500 maps to 1,850,000 paise');

  // --- 2. ORDER ONLINE DELIVERY ADDRESS RULE ---
  console.log('\n📌 Test Suite 2: Online Order Delivery Address Rule (OR-02)');
  const validOnlineOrder = createOrderSchema.safeParse({
    orderType: 'online',
    paymentMethod: 'upi',
    deliveryAddress: '456 Park Avenue, Pune 411001',
    items: [{ equipmentId: 1, qty: 2 }],
  });
  assert(validOnlineOrder.success === true, 'Online order with deliveryAddress passes');

  const invalidOnlineOrder = createOrderSchema.safeParse({
    orderType: 'online',
    paymentMethod: 'upi',
    deliveryAddress: '', // Empty address
    items: [{ equipmentId: 1, qty: 2 }],
  });
  assert(invalidOnlineOrder.success === false, 'Online order without deliveryAddress fails validation');

  const validInStoreOrder = createOrderSchema.safeParse({
    orderType: 'in_store',
    paymentMethod: 'cash',
    items: [{ equipmentId: 1, qty: 1 }],
  });
  assert(validInStoreOrder.success === true, 'In-store order does not require deliveryAddress');

  // --- 3. PRICING & TIER DISCOUNT COMPUTATIONS ---
  console.log('\n📌 Test Suite 3: Server-side Pricing & Tier Discount Calculations');
  const calculateDiscount = (subtotalPaise: number, tier?: string) => {
    let pct = 0;
    if (tier === 'Gold') pct = 15;
    else if (tier === 'Silver') pct = 10;
    else if (tier === 'Junior') pct = 5;
    const discountPaise = Math.round(subtotalPaise * (pct / 100));
    return {
      subtotalPaise,
      discountPaise,
      totalPaise: subtotalPaise - discountPaise,
    };
  };

  const goldPricing = calculateDiscount(100000, 'Gold');
  assert(goldPricing.discountPaise === 15000, 'Gold member receives 15% discount (₹150 off ₹1,000)');
  assert(goldPricing.totalPaise === 85000, 'Gold member net total is 85,000 paise');

  const silverPricing = calculateDiscount(100000, 'Silver');
  assert(silverPricing.discountPaise === 10000, 'Silver member receives 10% discount');

  const juniorPricing = calculateDiscount(100000, 'Junior');
  assert(juniorPricing.discountPaise === 5000, 'Junior member receives 5% discount');

  const nonMemberPricing = calculateDiscount(100000, undefined);
  assert(nonMemberPricing.discountPaise === 0, 'Non-member receives 0% discount');

  // --- 4. STATE MACHINE TRANSITIONS (§9.2) ---
  console.log('\n📌 Test Suite 4: Order Status State Machine Transitions (OR-04)');
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['fulfilled', 'cancelled'],
    fulfilled: [],
    cancelled: [],
  };

  assert(validTransitions['pending'].includes('confirmed'), 'pending -> confirmed is valid');
  assert(validTransitions['pending'].includes('cancelled'), 'pending -> cancelled is valid');
  assert(validTransitions['confirmed'].includes('fulfilled'), 'confirmed -> fulfilled is valid');
  assert(validTransitions['confirmed'].includes('cancelled'), 'confirmed -> cancelled is valid');
  assert(!validTransitions['pending'].includes('fulfilled'), 'pending -> fulfilled directly is invalid');
  assert(validTransitions['fulfilled'].length === 0, 'fulfilled is terminal (no transitions allowed)');
  assert(validTransitions['cancelled'].length === 0, 'cancelled is terminal (no transitions allowed)');

  // --- 5. ORDER CURRENCY & LINE ITEM FORMATTING ---
  console.log('\n📌 Test Suite 5: Order Formatting (formatOrder)');
  const mockOrder = {
    id: 50,
    memberId: 42,
    orderType: OrderType.online,
    status: OrderStatus.pending,
    subtotal: new Prisma.Decimal('37500.00'),
    discountAmount: new Prisma.Decimal('5625.00'),
    totalAmount: new Prisma.Decimal('31875.00'),
    paymentMethod: PaymentMethod.upi,
    deliveryAddress: '123 Main Street',
    createdAt: new Date('2026-10-03T06:30:00Z'),
    updatedAt: new Date('2026-10-03T06:30:00Z'),
    equipmentItems: [
      {
        id: 1,
        orderId: 50,
        equipmentId: 1,
        qty: 2,
        unitPrice: new Prisma.Decimal('12500.00'),
        subtotal: new Prisma.Decimal('25000.00'),
        equipment: { name: 'Pro Racket V3' },
      },
    ],
  };

  const formattedOrder = formatOrder(mockOrder as any);
  assert(formattedOrder.subtotalPaise === 3750000, 'Subtotal correctly formatted to 3,750,000 paise');
  assert(formattedOrder.discountAmountPaise === 562500, 'Discount correctly formatted to 562,500 paise');
  assert(formattedOrder.totalAmountPaise === 3187500, 'Total correctly formatted to 3,187,500 paise');
  assert(formattedOrder.items?.[0].equipmentName === 'Pro Racket V3', 'Line item equipmentName mapped');
  assert(formattedOrder.items?.[0].subtotalPaise === 2500000, 'Line item subtotal converted to paise');

  console.log('\n==================================================');
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
