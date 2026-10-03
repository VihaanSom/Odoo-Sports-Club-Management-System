import assert from 'node:assert';
import {
  tableIdParamSchema,
  createTableSchema,
  updateTableSchema,
} from '../src/modules/bar/tables/tables.validator';
import { TabStatus, Prisma } from '@prisma/client';

console.log('\n==================================================');
console.log('🧪 RUNNING BAR TABLES UNIT & VALIDATION TESTS (BT-01 to BT-03)');
console.log('==================================================\n');

let passed = 0;
let failed = 0;

function test(description: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Suite 1: Current Tab Occupancy Embedding Logic (BT-01)
// -----------------------------------------------------------------------------
console.log('📌 Test Suite 1: BT-01 Table Occupancy & Running Total Calculation');

test('computes active tab itemCount and runningTotalPaise correctly', () => {
  const mockOpenTab = {
    id: 10,
    status: TabStatus.open,
    openedAt: new Date('2026-10-03T12:00:00Z'),
    items: [
      { qty: 2, subtotal: new Prisma.Decimal('350.00') }, // ₹350.00 -> 35000 paise
      { qty: 1, subtotal: new Prisma.Decimal('150.00') }, // ₹150.00 -> 15000 paise
    ],
  };

  const itemCount = mockOpenTab.items.reduce((acc, it) => acc + it.qty, 0);
  const runningTotalPaise = mockOpenTab.items.reduce(
    (acc, it) => acc + Math.round(Number(it.subtotal) * 100),
    0
  );

  assert.strictEqual(itemCount, 3);
  assert.strictEqual(runningTotalPaise, 50000); // 35000 + 15000 = 50000 paise
});

test('handles empty open tab with zero items and zero running total', () => {
  const mockOpenTab = {
    id: 11,
    status: TabStatus.open,
    openedAt: new Date('2026-10-03T12:00:00Z'),
    items: [],
  };

  const itemCount = mockOpenTab.items.reduce((acc: number, it: any) => acc + it.qty, 0);
  const runningTotalPaise = mockOpenTab.items.reduce(
    (acc: number, it: any) => acc + Math.round(Number(it.subtotal) * 100),
    0
  );

  assert.strictEqual(itemCount, 0);
  assert.strictEqual(runningTotalPaise, 0);
});

// -----------------------------------------------------------------------------
// Suite 2: BT-02 Create Table Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 2: BT-02 Create Table Validation (createTableSchema)');

test('valid table creation passes and defaults capacity to 4 and isActive to true', () => {
  const parsed = createTableSchema.parse({
    tableNo: 'T10',
  });

  assert.strictEqual(parsed.tableNo, 'T10');
  assert.strictEqual(parsed.capacity, 4);
  assert.strictEqual(parsed.isActive, true);
});

test('trims whitespace and accepts custom capacity', () => {
  const parsed = createTableSchema.parse({
    tableNo: '  T12  ',
    capacity: 8,
  });

  assert.strictEqual(parsed.tableNo, 'T12');
  assert.strictEqual(parsed.capacity, 8);
});

test('rejects empty or whitespace-only tableNo', () => {
  assert.throws(() => {
    createTableSchema.parse({ tableNo: '   ' });
  });
});

test('rejects tableNo exceeding 10 characters', () => {
  assert.throws(() => {
    createTableSchema.parse({ tableNo: 'TABLE_NUMBER_TOO_LONG' });
  });
});

test('rejects capacity less than 1 or non-integer', () => {
  assert.throws(() => {
    createTableSchema.parse({ tableNo: 'T1', capacity: 0 });
  });
  assert.throws(() => {
    createTableSchema.parse({ tableNo: 'T1', capacity: -2 });
  });
  assert.throws(() => {
    createTableSchema.parse({ tableNo: 'T1', capacity: 4.5 });
  });
});

// -----------------------------------------------------------------------------
// Suite 3: Param Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 3: Param Validation (tableIdParamSchema)');

test('accepts valid positive integer ID', () => {
  const parsed = tableIdParamSchema.parse({ id: '5' });
  assert.strictEqual(parsed.id, 5);
});

test('rejects invalid or non-positive ID', () => {
  assert.throws(() => tableIdParamSchema.parse({ id: '0' }));
  assert.throws(() => tableIdParamSchema.parse({ id: '-3' }));
  assert.throws(() => tableIdParamSchema.parse({ id: 'xyz' }));
});

// -----------------------------------------------------------------------------
// Suite 4: BT-03 Update Table Validation & Immutability
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 4: BT-03 Update Validation & Immutability (updateTableSchema)');

test('allows partial update of single or multiple mutable fields', () => {
  const parsed1 = updateTableSchema.parse({ capacity: 6 });
  assert.strictEqual(parsed1.capacity, 6);

  const parsed2 = updateTableSchema.parse({ tableNo: 'T1-VIP', isActive: false });
  assert.strictEqual(parsed2.tableNo, 'T1-VIP');
  assert.strictEqual(parsed2.isActive, false);
});

test('rejects empty update payload (at least one field required)', () => {
  assert.throws(() => {
    updateTableSchema.parse({});
  });
});

test('rejects attempt to mutate immutable field id', () => {
  assert.throws(() => {
    updateTableSchema.parse({
      id: 99,
      capacity: 6,
    });
  });
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n==================================================');
console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
}
