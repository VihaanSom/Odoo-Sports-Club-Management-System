import type { MenuItem } from '@/types/menu';

export const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Espresso Double Shot',
    category: 'beverage',
    description: 'Rich arabica double pull with smooth golden crema.',
    pricePaise: 18000, // ₹180.00
    stockQty: 85,
    lowStockThreshold: 20,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 2,
    name: 'Iced Cold Brew Latte',
    category: 'beverage',
    description: '18-hour slow steeped cold brew with whole oat milk.',
    pricePaise: 24000, // ₹240.00
    stockQty: 42,
    lowStockThreshold: 15,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 3,
    name: 'Pro Whey Banana Shake',
    category: 'beverage',
    description: '30g whey isolate, ripe bananas, almond butter & chia seeds.',
    pricePaise: 32000, // ₹320.00
    stockQty: 30,
    lowStockThreshold: 10,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 4,
    name: 'Fresh Valencia Orange Juice',
    category: 'beverage',
    description: 'Cold pressed 100% natural Valencia oranges without added sugar.',
    pricePaise: 21000, // ₹210.00
    stockQty: 18,
    lowStockThreshold: 10,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 5,
    name: 'Sparkling Mineral Water (750ml)',
    category: 'beverage',
    description: 'Imported crisp carbonated spring water served chilled with lemon wedge.',
    pricePaise: 15000, // ₹150.00
    stockQty: 60,
    lowStockThreshold: 20,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 6,
    name: 'Champions Club Triple Sandwich',
    category: 'food',
    description: 'Grilled smoked chicken, cheddar, organic tomatoes, avocado spread on sourdough.',
    pricePaise: 39000, // ₹390.00
    stockQty: 24,
    lowStockThreshold: 8,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 7,
    name: 'Tandoori Paneer Multigrain Wrap',
    category: 'food',
    description: 'Marinated cottage cheese, bell peppers, mint yogurt dressing in flax wrap.',
    pricePaise: 34000, // ₹340.00
    stockQty: 19,
    lowStockThreshold: 6,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 8,
    name: 'High-Protein Quinoa Chicken Bowl',
    category: 'food',
    description: 'Roasted chicken breast, organic quinoa, edamame, kale, lemon herb vinaigrette.',
    pricePaise: 46000, // ₹460.00
    stockQty: 12,
    lowStockThreshold: 5,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 9,
    name: 'Mediterranean Greek Salad',
    category: 'food',
    description: 'Crisp cucumbers, kalamata olives, feta cheese cubes, extra virgin olive oil.',
    pricePaise: 31000, // ₹310.00
    stockQty: 15,
    lowStockThreshold: 5,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 10,
    name: 'Crispy Truffle Parmesan Fries',
    category: 'snack',
    description: 'Skin-on golden potato fries tossed with white truffle oil and aged parmesan.',
    pricePaise: 25000, // ₹250.00
    stockQty: 35,
    lowStockThreshold: 10,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 11,
    name: 'Loaded Corn Nachos with Pico & Guac',
    category: 'snack',
    description: 'Stone-ground tortilla chips, warm queso, house-made guacamole and salsa.',
    pricePaise: 28000, // ₹280.00
    stockQty: 22,
    lowStockThreshold: 8,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 12,
    name: 'Raw Almonds & Cranberry Trail Pack',
    category: 'snack',
    description: 'Roasted almonds, walnuts, pumpkin seeds and dried wild cranberries (100g).',
    pricePaise: 16000, // ₹160.00
    stockQty: 4,
    lowStockThreshold: 10, // low stock flag
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 13,
    name: 'Dark Chocolate Protein Energy Bar',
    category: 'snack',
    description: '70% Belgian dark chocolate coated whey crisp bar, 20g protein, zero added sugar.',
    pricePaise: 19000, // ₹190.00
    stockQty: 2,
    lowStockThreshold: 10, // low stock flag
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1622484216258-6927d3122c54?w=500&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01T08:00:00Z',
  },
];
