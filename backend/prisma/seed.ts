import { PrismaClient, MembershipTier, SportType, StaffRole, EquipmentCategory, MenuCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Membership Plans
  const plans = [
    { tier: MembershipTier.Gold, durationMonths: 1, price: 5000, courtRate: 200, shopDiscountPct: 15, barDiscountPct: 15 },
    { tier: MembershipTier.Gold, durationMonths: 6, price: 27000, courtRate: 180, shopDiscountPct: 15, barDiscountPct: 15 },
    { tier: MembershipTier.Gold, durationMonths: 12, price: 50000, courtRate: 150, shopDiscountPct: 20, barDiscountPct: 20 },
    { tier: MembershipTier.Silver, durationMonths: 1, price: 3000, courtRate: 350, shopDiscountPct: 10, barDiscountPct: 5 },
    { tier: MembershipTier.Silver, durationMonths: 6, price: 16000, courtRate: 300, shopDiscountPct: 10, barDiscountPct: 5 },
    { tier: MembershipTier.Silver, durationMonths: 12, price: 30000, courtRate: 250, shopDiscountPct: 10, barDiscountPct: 10 },
    { tier: MembershipTier.Junior, durationMonths: 1, price: 2000, courtRate: 250, shopDiscountPct: 5, barDiscountPct: 0 },
    { tier: MembershipTier.Junior, durationMonths: 6, price: 10500, courtRate: 200, shopDiscountPct: 5, barDiscountPct: 0 },
    { tier: MembershipTier.Junior, durationMonths: 12, price: 20000, courtRate: 150, shopDiscountPct: 5, barDiscountPct: 5 },
  ];

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: {
        tier_durationMonths: {
          tier: plan.tier,
          durationMonths: plan.durationMonths,
        },
      },
      update: plan,
      create: plan,
    });
  }
  console.log('✅ Seeded membership plans');

  // 2. Default Courts
  const courts = [
    { name: 'Center Court (Grass)', sport: SportType.tennis, openTime: '06:00', closeTime: '23:00' },
    { name: 'Court 2 (Clay)', sport: SportType.tennis, openTime: '06:00', closeTime: '23:00' },
    { name: 'Cricket Net 1 (Astro)', sport: SportType.cricket, openTime: '06:00', closeTime: '23:00' },
    { name: 'Cricket Net 2 (Turf)', sport: SportType.cricket, openTime: '06:00', closeTime: '23:00' },
  ];

  for (const court of courts) {
    const existing = await prisma.court.findFirst({ where: { name: court.name } });
    if (!existing) {
      await prisma.court.create({ data: court });
    }
  }
  console.log('✅ Seeded courts');

  // 3. Bar Tables
  const barTables = [
    { tableNo: 'T1', capacity: 4 },
    { tableNo: 'T2', capacity: 4 },
    { tableNo: 'T3', capacity: 6 },
    { tableNo: 'T4', capacity: 2 },
    { tableNo: 'T5', capacity: 8 },
  ];

  for (const table of barTables) {
    await prisma.barTable.upsert({
      where: { tableNo: table.tableNo },
      update: table,
      create: table,
    });
  }
  console.log('✅ Seeded bar tables');

  // 4. Admin Staff
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  await prisma.staff.upsert({
    where: { email: 'admin@championsclub.com' },
    update: {},
    create: {
      firstName: 'Club',
      lastName: 'Manager',
      email: 'admin@championsclub.com',
      passwordHash: adminPassword,
      role: StaffRole.admin,
      phone: '9876543210',
      salary: 75000,
    },
  });
  console.log('✅ Seeded default admin staff (admin@championsclub.com / Admin@12345)');

  // 5. Initial Equipment Items
  const sampleEquipment = [
    { name: 'Wilson Pro Staff 97 Racket', category: EquipmentCategory.racket, brand: 'Wilson', price: 18500, stockQty: 12, description: 'High performance tennis racket' },
    { name: 'Babolat Pure Aero Racket', category: EquipmentCategory.racket, brand: 'Babolat', price: 17200, stockQty: 8, description: 'Spin oriented professional racket' },
    { name: 'Slazenger Wimbledon Ball Can (3-Pack)', category: EquipmentCategory.ball, brand: 'Slazenger', price: 850, stockQty: 60, description: 'Official tournament tennis balls' },
    { name: 'SG Club Leather Cricket Ball', category: EquipmentCategory.ball, brand: 'SG', price: 650, stockQty: 40, description: 'Four piece alum tanned leather ball' },
    { name: 'Asics Gel-Resolution 9 Tennis Shoes', category: EquipmentCategory.shoe, brand: 'Asics', price: 12999, stockQty: 10, description: 'Advanced stability tennis court shoes' },
  ];

  for (const item of sampleEquipment) {
    const existing = await prisma.equipment.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.equipment.create({ data: item });
    }
  }
  console.log('✅ Seeded equipment items');

  // 6. Initial Menu Items
  const sampleMenu = [
    { name: 'Hydration Electrolyte Drink (500ml)', category: MenuCategory.beverage, price: 120, stockQty: 100, description: 'Optimal rehydration blend for athletes' },
    { name: 'Protein Shake (Banana & Whey)', category: MenuCategory.beverage, price: 250, stockQty: 50, description: '30g whey protein post-workout recovery shake' },
    { name: 'Club Grilled Chicken Sandwich', category: MenuCategory.food, price: 280, stockQty: 30, description: 'Whole wheat toasted triple layer sandwich' },
    { name: 'Fresh Fruit & Nut Bowl', category: MenuCategory.snack, price: 180, stockQty: 25, description: 'Seasonal mixed fruits with walnuts and almonds' },
  ];

  for (const item of sampleMenu) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }
  console.log('✅ Seeded menu items');

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
