import { formatEquipment } from '../src/modules/equipment/equipment.service';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  listEquipmentQuerySchema,
} from '../src/modules/equipment/equipment.validator';
import { Prisma, EquipmentCategory } from '@prisma/client';

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
  console.log('🧪 RUNNING EQUIPMENT INVENTORY UNIT & VALIDATION TESTS');
  console.log('==================================================\n');

  // --- 1. CURRENCY TRANSFORMATION ---
  console.log('📌 Test Suite 1: Currency Transformation (formatEquipment)');
  const mockEquipment = {
    id: 1,
    name: 'Wilson Pro Staff 97',
    category: EquipmentCategory.racket,
    brand: 'Wilson',
    description: 'Pro racket',
    price: new Prisma.Decimal('18500.00'), // ₹18,500 in DB
    stockQty: 12,
    lowStockThreshold: 5,
    isActive: true,
    imageUrl: '/uploads/equipment/racket.jpg',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
  const formatted = formatEquipment(mockEquipment as any);
  assert(formatted.pricePaise === 1850000, '₹18,500 Decimal correctly converts to 1,850,000 integer paise');

  // --- 2. ZOD VALIDATION: CREATE EQUIPMENT (EQ-02) ---
  console.log('\n📌 Test Suite 2: Create Equipment Validation (EQ-02)');
  const validCreate = createEquipmentSchema.safeParse({
    name: 'Babolat Pure Aero',
    category: 'racket',
    brand: 'Babolat',
    pricePaise: 1720000,
    stockQty: 8,
    lowStockThreshold: 3,
  });
  assert(validCreate.success === true, 'Valid equipment creation payload passes');

  const invalidCategory = createEquipmentSchema.safeParse({
    name: 'Invalid Item',
    category: 'unknown_category',
    pricePaise: 10000,
    stockQty: 5,
  });
  assert(invalidCategory.success === false, 'Invalid category enum is rejected');

  const negativePrice = createEquipmentSchema.safeParse({
    name: 'Negative Price Item',
    category: 'ball',
    pricePaise: -500,
    stockQty: 10,
  });
  assert(negativePrice.success === false, 'Negative pricePaise is rejected');

  // --- 3. ZOD VALIDATION: UPDATE EQUIPMENT IMMUTABILITY (EQ-04) ---
  console.log('\n📌 Test Suite 3: Update Equipment Validation & Immutability (EQ-04)');
  const validUpdate = updateEquipmentSchema.safeParse({
    stockQty: 25,
    pricePaise: 1650000,
  });
  assert(validUpdate.success === true, 'Valid partial update of stock and price passes');

  const immutableUpdate = updateEquipmentSchema.safeParse({
    id: 99, // Attempt to mutate ID
  });
  assert(immutableUpdate.success === false, 'Attempt to mutate id is rejected by Zod');

  // --- 4. ZOD VALIDATION: LIST EQUIPMENT QUERY (EQ-01) ---
  console.log('\n📌 Test Suite 4: Query Parameters Validation (EQ-01)');
  const validQuery = listEquipmentQuerySchema.safeParse({
    page: '2',
    pageSize: '10',
    category: 'shoe',
    isActive: 'true',
    sortBy: 'price',
    sortOrder: 'desc',
  });
  assert(validQuery.success === true, 'Valid query params with string coercions pass');
  if (validQuery.success) {
    assert(validQuery.data.page === 2, 'Page coerced to integer 2');
    assert(validQuery.data.isActive === true, 'isActive coerced to boolean true');
  }

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
