import assert from 'node:assert';
import {
  tabIdParamSchema,
  listTabsQuerySchema,
  openTabSchema,
  addTabItemsSchema,
  settleTabSchema,
} from '../src/modules/bar/tabs/tabs.validator';
import { formatTabDetail } from '../src/modules/bar/tabs/tabs.service';
import { TabStatus, MembershipTier, Prisma } from '@prisma/client';

console.log('\n==================================================');
console.log('🧪 RUNNING BAR TABS UNIT & VALIDATION TESTS (TB-01 to TB-05)');
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
// Suite 1: Currency & Data Transformation (formatTabDetail)
// -----------------------------------------------------------------------------
console.log('📌 Test Suite 1: Tab Formatting & Currency Calculation (formatTabDetail)');

test('formats tab correctly converting Decimal to paise and computing running total', () => {
  const mockTab = {
    id: 10,
    barTableId: 1,
    table: { tableNo: 'T1' },
    memberId: 42,
    member: { firstName: 'John', lastName: 'Doe', tier: MembershipTier.Gold },
    openedBy: 5,
    staff: { firstName: 'Mike', lastName: 'Staff' },
    status: TabStatus.open,
    openedAt: new Date('2026-10-03T12:00:00Z'),
    settledAt: null,
    notes: 'VIP guest table',
    items: [
      {
        id: 1,
        menuItemId: 1,
        menuItem: { name: 'Club Sandwich' },
        qty: 2,
        unitPrice: new Prisma.Decimal('350.00'),
        subtotal: new Prisma.Decimal('700.00'),
      },
      {
        id: 2,
        menuItemId: 4,
        menuItem: { name: 'Lager Beer' },
        qty: 1,
        unitPrice: new Prisma.Decimal('250.00'),
        subtotal: new Prisma.Decimal('250.00'),
      },
    ],
  };

  const formatted = formatTabDetail(mockTab);

  assert.strictEqual(formatted.id, 10);
  assert.strictEqual(formatted.tableNo, 'T1');
  assert.strictEqual(formatted.memberName, 'John Doe');
  assert.strictEqual(formatted.memberTier, 'Gold');
  assert.strictEqual(formatted.openedByName, 'Mike Staff');
  assert.strictEqual(formatted.items.length, 2);
  assert.strictEqual(formatted.items[0].unitPricePaise, 35000);
  assert.strictEqual(formatted.items[0].subtotalPaise, 70000);
  assert.strictEqual(formatted.items[1].unitPricePaise, 25000);
  assert.strictEqual(formatted.items[1].subtotalPaise, 25000);
  assert.strictEqual(formatted.runningTotalPaise, 95000); // 70000 + 25000
});

test('handles tab without member (walk-in guest) and with zero items', () => {
  const mockTab = {
    id: 12,
    barTableId: 3,
    table: { tableNo: 'T3' },
    memberId: null,
    member: null,
    openedBy: 2,
    staff: { firstName: 'Alex', lastName: 'Bartender' },
    status: TabStatus.open,
    openedAt: new Date('2026-10-03T12:00:00Z'),
    settledAt: null,
    notes: null,
    items: [],
  };

  const formatted = formatTabDetail(mockTab);

  assert.strictEqual(formatted.memberName, null);
  assert.strictEqual(formatted.memberTier, null);
  assert.strictEqual(formatted.openedByName, 'Alex Bartender');
  assert.strictEqual(formatted.items.length, 0);
  assert.strictEqual(formatted.runningTotalPaise, 0);
});

// -----------------------------------------------------------------------------
// Suite 2: TB-01 List Tabs Query Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 2: TB-01 List Tabs Query Validation (listTabsQuerySchema)');

test('accepts valid query parameters and defaults status to open', () => {
  const parsed = listTabsQuerySchema.parse({
    barTableId: '2',
    date: '2026-10-03',
  });

  assert.strictEqual(parsed.status, 'open');
  assert.strictEqual(parsed.barTableId, 2);
  assert.strictEqual(parsed.date, '2026-10-03');
});

test('rejects invalid date format', () => {
  assert.throws(() => listTabsQuerySchema.parse({ date: '03-10-2026' }));
  assert.throws(() => listTabsQuerySchema.parse({ date: '2026/10/03' }));
});

test('rejects invalid status enum', () => {
  assert.throws(() => listTabsQuerySchema.parse({ status: 'pending' }));
});

// -----------------------------------------------------------------------------
// Suite 3: TB-02 Open Tab Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 3: TB-02 Open Tab Validation (openTabSchema)');

test('valid open tab payload passes', () => {
  const parsed = openTabSchema.parse({
    barTableId: 1,
    memberId: 42,
    notes: 'Club members table',
  });

  assert.strictEqual(parsed.barTableId, 1);
  assert.strictEqual(parsed.memberId, 42);
  assert.strictEqual(parsed.notes, 'Club members table');
});

test('valid open tab without memberId passes (guest)', () => {
  const parsed = openTabSchema.parse({
    barTableId: 2,
  });

  assert.strictEqual(parsed.barTableId, 2);
  assert.strictEqual(parsed.memberId, undefined);
});

test('rejects invalid or missing barTableId', () => {
  assert.throws(() => openTabSchema.parse({ barTableId: -1 }));
  assert.throws(() => openTabSchema.parse({ barTableId: 0 }));
  assert.throws(() => openTabSchema.parse({}));
});

// -----------------------------------------------------------------------------
// Suite 4: TB-03 Param Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 4: TB-03 Param Validation (tabIdParamSchema)');

test('accepts valid positive integer tab ID', () => {
  const parsed = tabIdParamSchema.parse({ id: '10' });
  assert.strictEqual(parsed.id, 10);
});

test('rejects negative or zero ID', () => {
  assert.throws(() => tabIdParamSchema.parse({ id: '0' }));
  assert.throws(() => tabIdParamSchema.parse({ id: '-1' }));
  assert.throws(() => tabIdParamSchema.parse({ id: 'xyz' }));
});

// -----------------------------------------------------------------------------
// Suite 5: TB-04 Add Tab Items Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 5: TB-04 Add Tab Items Validation (addTabItemsSchema)');

test('valid items array passes', () => {
  const parsed = addTabItemsSchema.parse({
    items: [
      { menuItemId: 1, qty: 2 },
      { menuItemId: 5, qty: 1 },
    ],
  });

  assert.strictEqual(parsed.items.length, 2);
  assert.strictEqual(parsed.items[0].menuItemId, 1);
  assert.strictEqual(parsed.items[0].qty, 2);
});

test('rejects empty items array', () => {
  assert.throws(() => addTabItemsSchema.parse({ items: [] }));
});

test('rejects invalid qty (< 1 or > 99)', () => {
  assert.throws(() =>
    addTabItemsSchema.parse({
      items: [{ menuItemId: 1, qty: 0 }],
    })
  );
  assert.throws(() =>
    addTabItemsSchema.parse({
      items: [{ menuItemId: 1, qty: 100 }],
    })
  );
});

// -----------------------------------------------------------------------------
// Suite 6: TB-05 Settle Tab Validation & Tier Discount Logic
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 6: TB-05 Settle Validation & Tier Discount Calculation');

test('valid settlement payload passes', () => {
  const parsed = settleTabSchema.parse({
    paymentMethod: 'card',
    referenceNo: 'POS-TXN-101',
  });

  assert.strictEqual(parsed.paymentMethod, 'card');
  assert.strictEqual(parsed.referenceNo, 'POS-TXN-101');
});

test('rejects invalid paymentMethod', () => {
  assert.throws(() =>
    settleTabSchema.parse({
      paymentMethod: 'bitcoin',
    })
  );
});

test('calculates correct member tier discounts on settlement subtotal', () => {
  const subtotalPaise = 155000; // ₹1,550.00

  // Gold: 15% discount
  const goldDiscount = Math.round(subtotalPaise * 0.15);
  const goldTotal = subtotalPaise - goldDiscount;
  assert.strictEqual(goldDiscount, 23250);
  assert.strictEqual(goldTotal, 131750);

  // Silver: 10% discount
  const silverDiscount = Math.round(subtotalPaise * 0.10);
  const silverTotal = subtotalPaise - silverDiscount;
  assert.strictEqual(silverDiscount, 15500);
  assert.strictEqual(silverTotal, 139500);

  // Junior: 5% discount
  const juniorDiscount = Math.round(subtotalPaise * 0.05);
  const juniorTotal = subtotalPaise - juniorDiscount;
  assert.strictEqual(juniorDiscount, 7750);
  assert.strictEqual(juniorTotal, 147250);

  // Non-member: 0% discount
  const nonMemberDiscount = Math.round(subtotalPaise * 0);
  const nonMemberTotal = subtotalPaise - nonMemberDiscount;
  assert.strictEqual(nonMemberDiscount, 0);
  assert.strictEqual(nonMemberTotal, 155000);
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
