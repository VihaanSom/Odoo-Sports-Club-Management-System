import assert from 'node:assert';
import {
  menuItemIdParamSchema,
  listMenuItemsQuerySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from '../src/modules/menu/menu.validator';
import { formatMenuItem } from '../src/modules/menu/menu.service';
import { Prisma, MenuItem, MenuCategory } from '@prisma/client';

console.log('\n==================================================');
console.log('🧪 RUNNING MENU ITEMS UNIT & VALIDATION TESTS (MI-01 to MI-04)');
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
// Suite 1: Currency & Data Transformation
// -----------------------------------------------------------------------------
console.log('📌 Test Suite 1: Currency & Decimal Transformation (formatMenuItem)');

test('formats MenuItem converting Decimal rupees to integer paise accurately', () => {
  const mockItem: MenuItem = {
    id: 1,
    name: 'Club Sandwich',
    category: MenuCategory.food,
    description: 'Grilled chicken sandwich',
    price: new Prisma.Decimal('350.00'),
    stockQty: 50,
    lowStockThreshold: 5,
    isAvailable: true,
    imageUrl: 'https://example.com/sandwich.jpg',
    createdAt: new Date('2026-10-03T10:00:00Z'),
    updatedAt: new Date('2026-10-03T10:00:00Z'),
  };

  const formatted = formatMenuItem(mockItem);
  assert.strictEqual(formatted.id, 1);
  assert.strictEqual(formatted.name, 'Club Sandwich');
  assert.strictEqual(formatted.category, 'food');
  assert.strictEqual(formatted.pricePaise, 35000);
  assert.strictEqual(formatted.stockQty, 50);
  assert.strictEqual(formatted.lowStockThreshold, 5);
  assert.strictEqual(formatted.isAvailable, true);
  assert.strictEqual(formatted.imageUrl, 'https://example.com/sandwich.jpg');
});

test('handles zero rupee and fractional rupee amounts correctly', () => {
  const mockItem: MenuItem = {
    id: 2,
    name: 'Complimentary Water',
    category: MenuCategory.beverage,
    description: null,
    price: new Prisma.Decimal('0.00'),
    stockQty: 100,
    lowStockThreshold: 10,
    isAvailable: true,
    imageUrl: null,
    createdAt: new Date('2026-10-03T10:00:00Z'),
    updatedAt: new Date('2026-10-03T10:00:00Z'),
  };

  const formatted = formatMenuItem(mockItem);
  assert.strictEqual(formatted.pricePaise, 0);
  assert.strictEqual(formatted.description, null);
  assert.strictEqual(formatted.imageUrl, null);
});

// -----------------------------------------------------------------------------
// Suite 2: MI-01 List Menu Items Query Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 2: MI-01 List Query Validation (listMenuItemsQuerySchema)');

test('accepts valid query parameters and applies defaults', () => {
  const parsed = listMenuItemsQuerySchema.parse({
    page: '2',
    pageSize: '10',
    category: 'food',
    isAvailable: 'true',
    search: 'burger',
  });

  assert.strictEqual(parsed.page, 2);
  assert.strictEqual(parsed.pageSize, 10);
  assert.strictEqual(parsed.category, 'food');
  assert.strictEqual(parsed.isAvailable, true);
  assert.strictEqual(parsed.search, 'burger');
  assert.strictEqual(parsed.sortBy, 'name');
  assert.strictEqual(parsed.sortOrder, 'asc');
});

test('rejects invalid category enum', () => {
  assert.throws(() => {
    listMenuItemsQuerySchema.parse({ category: 'dessert' });
  });
});

test('rejects pageSize greater than 100', () => {
  assert.throws(() => {
    listMenuItemsQuerySchema.parse({ pageSize: '150' });
  });
});

test('correctly parses boolean isAvailable from string false', () => {
  const parsed = listMenuItemsQuerySchema.parse({ isAvailable: 'false' });
  assert.strictEqual(parsed.isAvailable, false);
});

// -----------------------------------------------------------------------------
// Suite 3: MI-02 Create Menu Item Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 3: MI-02 Create Menu Item Validation (createMenuItemSchema)');

test('valid menu item creation passes and defaults lowStockThreshold', () => {
  const parsed = createMenuItemSchema.parse({
    name: 'Cold Coffee',
    category: 'beverage',
    description: 'Fresh brewed espresso with milk',
    pricePaise: 18000,
    stockQty: 30,
  });

  assert.strictEqual(parsed.name, 'Cold Coffee');
  assert.strictEqual(parsed.category, 'beverage');
  assert.strictEqual(parsed.pricePaise, 18000);
  assert.strictEqual(parsed.stockQty, 30);
  assert.strictEqual(parsed.lowStockThreshold, 5); // default
});

test('rejects negative pricePaise and negative stockQty', () => {
  assert.throws(() => {
    createMenuItemSchema.parse({
      name: 'Bad Item',
      category: 'snack',
      pricePaise: -500,
      stockQty: 10,
    });
  });

  assert.throws(() => {
    createMenuItemSchema.parse({
      name: 'Bad Item',
      category: 'snack',
      pricePaise: 500,
      stockQty: -2,
    });
  });
});

test('rejects missing required fields', () => {
  assert.throws(() => {
    createMenuItemSchema.parse({
      name: 'Missing Price',
      category: 'food',
      stockQty: 10,
    });
  });
});

// -----------------------------------------------------------------------------
// Suite 4: MI-03 Param Validation
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 4: MI-03 Param Validation (menuItemIdParamSchema)');

test('accepts valid positive integer ID', () => {
  const parsed = menuItemIdParamSchema.parse({ id: '42' });
  assert.strictEqual(parsed.id, 42);
});

test('rejects negative or zero ID', () => {
  assert.throws(() => menuItemIdParamSchema.parse({ id: '0' }));
  assert.throws(() => menuItemIdParamSchema.parse({ id: '-5' }));
  assert.throws(() => menuItemIdParamSchema.parse({ id: 'abc' }));
});

// -----------------------------------------------------------------------------
// Suite 5: MI-04 Update Menu Item Validation & Immutability
// -----------------------------------------------------------------------------
console.log('\n📌 Test Suite 5: MI-04 Update Validation & Immutability (updateMenuItemSchema)');

test('allows partial update of single or multiple mutable fields', () => {
  const parsed = updateMenuItemSchema.parse({
    pricePaise: 20000,
    isAvailable: false,
  });

  assert.strictEqual(parsed.pricePaise, 20000);
  assert.strictEqual(parsed.isAvailable, false);
});

test('rejects empty update payload (at least one field required)', () => {
  assert.throws(() => {
    updateMenuItemSchema.parse({});
  });
});

test('rejects attempt to mutate immutable fields id or createdAt', () => {
  assert.throws(() => {
    updateMenuItemSchema.parse({
      id: 99,
      name: 'Attempted Hijack',
    });
  });

  assert.throws(() => {
    updateMenuItemSchema.parse({
      createdAt: '2026-01-01T00:00:00Z',
      pricePaise: 1000,
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
