import {
  PrismaClient,
  MembershipTier,
  MembershipStatus,
  SportType,
  BookingType,
  BookingStatus,
  PaymentMethod,
  OrderType,
  OrderStatus,
  EquipmentCategory,
  MenuCategory,
  TabStatus,
  LeadStatus,
  StaffRole,
  LeaveStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting full database seed for Champions Sports Club...');

  // ==========================================
  // 0. CLEANUP EXISTING DATA (Reverse FK order)
  // ==========================================
  console.log('🧹 Cleaning up existing records...');
  await prisma.payment.deleteMany();
  await prisma.orderItemEquipment.deleteMany();
  await prisma.orderItemMenu.deleteMany();
  await prisma.order.deleteMany();
  await prisma.barTabItem.deleteMany();
  await prisma.barTab.deleteMany();
  await prisma.bookingParticipant.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.memberAddress.deleteMany();
  await prisma.member.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.court.deleteMany();
  await prisma.barTable.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.membershipPlan.deleteMany();
  console.log('✅ Cleanup complete');

  // ==========================================
  // PASSWORD HASHES (Pre-computed for speed)
  // ==========================================
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const staffPassword = await bcrypt.hash('Staff@12345', 10);
  const memberPassword = await bcrypt.hash('Member@12345', 10);

  // Reference dates
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const oneYearFromNow = new Date(today);
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const sixMonthsFromNow = new Date(today);
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Helper for generating timestamps on a specific day
  const createDateTime = (baseDate: Date, hours: number, minutes = 0) => {
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // ==========================================
  // 1. MEMBERSHIP PLANS (9 plans)
  // ==========================================
  console.log('📌 Seeding membership plans...');
  const plansData = [
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

  for (const plan of plansData) {
    await prisma.membershipPlan.create({ data: plan });
  }
  console.log(`✅ Seeded ${plansData.length} membership plans`);

  // ==========================================
  // 2. STAFF ACCOUNTS (8 staff)
  // ==========================================
  console.log('📌 Seeding staff accounts...');
  const staffRecords = [
    {
      key: 'admin',
      firstName: 'Club',
      lastName: 'Manager',
      email: 'admin@championsclub.com',
      passwordHash: adminPassword,
      role: StaffRole.admin,
      phone: '9876543210',
      salary: 85000,
      isActive: true,
    },
    {
      key: 'frontdesk1',
      firstName: 'Aarav',
      lastName: 'Verma',
      email: 'frontdesk@championsclub.com',
      passwordHash: staffPassword,
      role: StaffRole.front_desk,
      phone: '9876543211',
      salary: 38000,
      isActive: true,
    },
    {
      key: 'frontdesk2',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.frontdesk@championsclub.com',
      passwordHash: staffPassword,
      role: StaffRole.front_desk,
      phone: '9876543213',
      salary: 35000,
      isActive: true,
    },
    {
      key: 'bar1',
      firstName: 'Alex',
      lastName: 'Mercer',
      email: 'alex.bar@championsclub.com',
      passwordHash: staffPassword,
      role: StaffRole.bar,
      phone: '9876543214',
      salary: 42000,
      isActive: true,
    },
    {
      key: 'bar2',
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'priya.bar@championsclub.com',
      passwordHash: staffPassword,
      role: StaffRole.bar,
      phone: '9876543215',
      salary: 32000,
      isActive: true,
    },
    {
      key: 'shop1',
      firstName: 'Marcus',
      lastName: 'Taylor',
      email: 'marcus.shop@championsclub.com',
      passwordHash: staffPassword,
      role: StaffRole.shop,
      phone: '9876543216',
      salary: 40000,
      isActive: true,
    },
    {
      key: 'shop2',
      firstName: 'Vikram',
      lastName: 'Roy',
      email: 'vikram.shop@championsclub.com',
      passwordHash: staffPassword,
      role: StaffRole.shop,
      phone: '9876543217',
      salary: 30000,
      isActive: true,
    },
    {
      key: 'inactiveStaff',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'inactive.staff@championsclub.com',
      passwordHash: staffPassword,
      role: StaffRole.bar,
      phone: '9876543212',
      salary: 30000,
      isActive: false,
    },
  ];

  const staffMap: Record<string, any> = {};
  for (const s of staffRecords) {
    const { key, ...data } = s;
    staffMap[key] = await prisma.staff.create({ data });
  }
  console.log(`✅ Seeded ${staffRecords.length} staff members`);

  // ==========================================
  // 3. MEMBERS & ADDRESSES (10 members)
  // ==========================================
  console.log('📌 Seeding members and addresses...');
  const membersData = [
    {
      key: 'rahul',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.gold@championsclub.com',
      phone: '9820012345',
      dateOfBirth: new Date('1988-06-15'),
      tier: MembershipTier.Gold,
      membershipStart: oneYearAgo,
      membershipEnd: oneYearFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: 'Flat 402, Sunshine Heights',
        addrLine2: 'Worli Sea Face',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400018',
      },
    },
    {
      key: 'priya',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.silver@championsclub.com',
      phone: '9820054321',
      dateOfBirth: new Date('1994-09-22'),
      tier: MembershipTier.Silver,
      membershipStart: sixMonthsFromNow,
      membershipEnd: oneYearFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: 'B-12, Koregaon Park Enclave',
        addrLine2: 'Lane 7',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
      },
    },
    {
      key: 'roger',
      firstName: 'Roger',
      lastName: 'Federer',
      email: 'roger.f@tennis.ch',
      phone: '9819001122',
      dateOfBirth: new Date('1981-08-08'),
      tier: MembershipTier.Gold,
      membershipStart: oneYearAgo,
      membershipEnd: oneYearFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: 'Villa 8, Pali Hill',
        addrLine2: 'Near Nargis Dutt Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
      },
    },
    {
      key: 'serena',
      firstName: 'Serena',
      lastName: 'Williams',
      email: 'serena.w@champs.com',
      phone: '9821003344',
      dateOfBirth: new Date('1981-09-26'),
      tier: MembershipTier.Gold,
      membershipStart: oneYearAgo,
      membershipEnd: oneYearFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: '1401 Ocean Crest',
        addrLine2: 'Juhu Tara Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400049',
      },
    },
    {
      key: 'rafa',
      firstName: 'Rafael',
      lastName: 'Nadal',
      email: 'rafa.n@mallorca.es',
      phone: '9820556677',
      dateOfBirth: new Date('1986-06-03'),
      tier: MembershipTier.Gold,
      membershipStart: oneYearAgo,
      membershipEnd: oneYearFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: 'Penthouse 21, Lodha Bellissimo',
        addrLine2: 'N.M. Joshi Marg, Mahalaxmi',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400011',
      },
    },
    {
      key: 'virat',
      firstName: 'Virat',
      lastName: 'Kohli',
      email: 'virat.k@cricket.in',
      phone: '9820112233',
      dateOfBirth: new Date('1988-11-05'),
      tier: MembershipTier.Gold,
      membershipStart: oneYearAgo,
      membershipEnd: oneYearFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: 'Tower C, Omkar 1973',
        addrLine2: 'Dr. Annie Besant Road, Worli',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400030',
      },
    },
    {
      key: 'rohit',
      firstName: 'Rohit',
      lastName: 'Sharma',
      email: 'rohit.s@cricket.in',
      phone: '9820778899',
      dateOfBirth: new Date('1987-04-30'),
      tier: MembershipTier.Silver,
      membershipStart: sixMonthsFromNow,
      membershipEnd: oneYearFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: '2902 Ahuja Towers',
        addrLine2: 'Raja Bhau Anant Desai Marg, Prabhadevi',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400025',
      },
    },
    {
      key: 'emma',
      firstName: 'Emma',
      lastName: 'Raducanu',
      email: 'emma.r@uktennis.co.uk',
      phone: '9820889900',
      dateOfBirth: new Date('2002-11-13'),
      tier: MembershipTier.Silver,
      membershipStart: threeMonthsAgo,
      membershipEnd: sixMonthsFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: 'Lake Castle 702',
        addrLine2: 'Hiranandani Gardens, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400076',
      },
    },
    {
      key: 'carlos',
      firstName: 'Carlos',
      lastName: 'Alcaraz',
      email: 'carlos.a@espana.es',
      phone: '9820990011',
      dateOfBirth: new Date('2008-05-05'), // Junior age
      tier: MembershipTier.Junior,
      membershipStart: threeMonthsAgo,
      membershipEnd: sixMonthsFromNow,
      status: MembershipStatus.active,
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: '502 Green Acres',
        addrLine2: 'Lokhandwala Complex, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
      },
    },
    {
      key: 'expiredMember',
      firstName: 'Rohan',
      lastName: 'Gupta',
      email: 'expired.member@championsclub.com',
      phone: '9820099999',
      dateOfBirth: new Date('2007-03-12'),
      tier: MembershipTier.Junior,
      membershipStart: oneYearAgo,
      membershipEnd: threeMonthsAgo,
      status: MembershipStatus.expired,
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
      address: {
        addrLine1: 'B-301, Evershine Nagar',
        addrLine2: 'Link Road, Malad West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400064',
      },
    },
  ];

  const memberMap: Record<string, any> = {};
  for (const m of membersData) {
    const { key, address, ...memberFields } = m;
    const member = await prisma.member.create({
      data: {
        ...memberFields,
        passwordHash: memberPassword,
        addresses: {
          create: address,
        },
      },
    });
    memberMap[key] = member;
  }
  console.log(`✅ Seeded ${membersData.length} members with addresses`);

  // ==========================================
  // 4. COURTS & PITCHES (7 courts)
  // ==========================================
  console.log('📌 Seeding courts...');
  const courtsData = [
    { key: 'clay1', name: 'Center Court 1 (Clay)', sport: SportType.tennis, openTime: '06:00', closeTime: '22:00', isActive: true },
    { key: 'hard2', name: 'Grand Slam Court 2 (Hard)', sport: SportType.tennis, openTime: '06:00', closeTime: '22:00', isActive: true },
    { key: 'lawn3', name: 'Grass Court 3 (Lawn)', sport: SportType.tennis, openTime: '07:00', closeTime: '20:00', isActive: true },
    { key: 'netA', name: 'Indoor Turf Cricket Net A', sport: SportType.cricket, openTime: '06:00', closeTime: '23:00', isActive: true },
    { key: 'netB', name: 'Indoor Turf Cricket Net B', sport: SportType.cricket, openTime: '06:00', closeTime: '23:00', isActive: true },
    { key: 'pitch1', name: 'Floodlit Match Pitch 1', sport: SportType.cricket, openTime: '07:00', closeTime: '22:00', isActive: true },
    { key: 'hard4', name: 'Practice Court 4 (Hard)', sport: SportType.tennis, openTime: '06:00', closeTime: '22:00', isActive: false },
  ];

  const courtMap: Record<string, any> = {};
  for (const c of courtsData) {
    const { key, ...data } = c;
    courtMap[key] = await prisma.court.create({ data });
  }
  console.log(`✅ Seeded ${courtsData.length} courts`);

  // ==========================================
  // 5. BAR TABLES (10 tables)
  // ==========================================
  console.log('📌 Seeding bar tables...');
  const tablesData = [
    { key: 't1', tableNo: 'T-01', capacity: 2, isActive: true },
    { key: 't2', tableNo: 'T-02', capacity: 4, isActive: true },
    { key: 't3', tableNo: 'T-03', capacity: 2, isActive: true },
    { key: 't4', tableNo: 'T-04', capacity: 6, isActive: true },
    { key: 't5', tableNo: 'T-05', capacity: 4, isActive: true },
    { key: 't6', tableNo: 'T-06', capacity: 8, isActive: true },
    { key: 't7', tableNo: 'T-07', capacity: 4, isActive: true },
    { key: 't8', tableNo: 'T-08', capacity: 2, isActive: false },
    { key: 'lounge1', tableNo: 'Lounge-01', capacity: 6, isActive: true },
    { key: 'barCounter', tableNo: 'Bar-01', capacity: 4, isActive: true },
  ];

  const tableMap: Record<string, any> = {};
  for (const t of tablesData) {
    const { key, ...data } = t;
    tableMap[key] = await prisma.barTable.create({ data });
  }
  console.log(`✅ Seeded ${tablesData.length} bar tables`);

  // ==========================================
  // 6. EQUIPMENT (15 items)
  // ==========================================
  console.log('📌 Seeding equipment items...');
  const equipmentData = [
    {
      key: 'racketWilson',
      name: 'Wilson Pro Staff 97 v14 Racket',
      category: EquipmentCategory.racket,
      brand: 'Wilson',
      description: 'Precision feel and pinpoint control designed for competitive tennis players.',
      price: 24999.0,
      stockQty: 18,
      lowStockThreshold: 5,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8889?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'racketBabolat',
      name: 'Babolat Pure Drive 2024',
      category: EquipmentCategory.racket,
      brand: 'Babolat',
      description: 'Explosive power and versatile spin profile for baseline attack.',
      price: 21999.0,
      stockQty: 4,
      lowStockThreshold: 5,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'racketHead',
      name: 'Head Speed Pro 2024 Racket',
      category: EquipmentCategory.racket,
      brand: 'Head',
      description: 'Novak Djokovic signature series engineered for ultimate speed and stability.',
      price: 22499.0,
      stockQty: 10,
      lowStockThreshold: 4,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'cricketBatTon',
      name: 'SS Ton Vintage English Willow Bat',
      category: EquipmentCategory.accessory,
      brand: 'SS',
      description: 'Hand crafted Grade 1 English willow with massive concave edges and sweet spot balance.',
      price: 28500.0,
      stockQty: 6,
      lowStockThreshold: 3,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'ballsTennisSlazenger',
      name: 'Slazenger Wimbledon Tennis Balls (Can of 4)',
      category: EquipmentCategory.ball,
      brand: 'Slazenger',
      description: 'Tour official pressurized tennis balls with Hydroguard moisture repelling felt.',
      price: 899.0,
      stockQty: 140,
      lowStockThreshold: 30,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'ballCricketKookaburra',
      name: 'Kookaburra Turf Match Cricket Ball',
      category: EquipmentCategory.ball,
      brand: 'Kookaburra',
      description: 'Hand stitched 4-piece alum tanned steerhide leather match cricket ball.',
      price: 4499.0,
      stockQty: 3,
      lowStockThreshold: 6,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'ballCricketSG',
      name: 'SG Club Leather Cricket Ball (White)',
      category: EquipmentCategory.ball,
      brand: 'SG',
      description: 'Four-piece alum tanned high grade core leather ball for floodlit T20 games.',
      price: 750.0,
      stockQty: 55,
      lowStockThreshold: 15,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'shoesAsics',
      name: 'Asics Gel-Resolution 9 Clay Court Shoes',
      category: EquipmentCategory.shoe,
      brand: 'Asics',
      description: 'Dynawall support and Gel cushioning engineered for aggressive clay movement.',
      price: 13999.0,
      stockQty: 12,
      lowStockThreshold: 4,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'shoesNikeVapor',
      name: 'Nike Court Air Zoom Vapor Pro 2',
      category: EquipmentCategory.shoe,
      brand: 'Nike',
      description: 'Low-to-the-court design with responsive Air Zoom unit for rapid changes of direction.',
      price: 11495.0,
      stockQty: 8,
      lowStockThreshold: 4,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'poloNike',
      name: 'Nike Court Dri-FIT Club Polo',
      category: EquipmentCategory.apparel,
      brand: 'Nike',
      description: 'Sweat-wicking pique fabric with ribbed collar and tailored athletic silhouette.',
      price: 3495.0,
      stockQty: 25,
      lowStockThreshold: 8,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'shortsAdidas',
      name: 'Adidas Club Tennis Stretch Shorts',
      category: EquipmentCategory.apparel,
      brand: 'Adidas',
      description: 'Aeroready moisture absorbing 7-inch tennis shorts with ball storage pockets.',
      price: 2799.0,
      stockQty: 30,
      lowStockThreshold: 10,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'overgripTourna',
      name: 'Tourna Grip Original Overgrip (Pack of 10)',
      category: EquipmentCategory.accessory,
      brand: 'Tourna',
      description: 'Dry feel moisture absorbing sweat overgrips used by world class touring pros.',
      price: 1899.0,
      stockQty: 45,
      lowStockThreshold: 10,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'flaskClub',
      name: 'Champions Club Insulated Steel Flask (1000ml)',
      category: EquipmentCategory.accessory,
      brand: 'Champions Club',
      description: 'Double walled vacuum insulated 304 food-grade stainless steel club water bottle.',
      price: 1499.0,
      stockQty: 2,
      lowStockThreshold: 5,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'stringLuxilon',
      name: 'Luxilon ALU Power 125 Tennis String Reel',
      category: EquipmentCategory.accessory,
      brand: 'Luxilon',
      description: '220m poly-ether-ether reel offering unrivaled power, control, and spin potential.',
      price: 19500.0,
      stockQty: 5,
      lowStockThreshold: 2,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1511067007772-9da28925790b?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'helmetCricket',
      name: 'Shrey Master Class Air Cricket Helmet',
      category: EquipmentCategory.accessory,
      brand: 'Shrey',
      description: 'Titanium grille lightweight helmet with extended rear coverage for superior protection.',
      price: 7999.0,
      stockQty: 7,
      lowStockThreshold: 3,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const equipmentMap: Record<string, any> = {};
  for (const eq of equipmentData) {
    const { key, ...data } = eq;
    equipmentMap[key] = await prisma.equipment.create({ data });
  }
  console.log(`✅ Seeded ${equipmentData.length} equipment items`);

  // ==========================================
  // 7. MENU ITEMS (18 items)
  // ==========================================
  console.log('📌 Seeding cafe and lounge menu items...');
  const menuData = [
    {
      key: 'espresso',
      name: 'Espresso Double Shot',
      category: MenuCategory.beverage,
      description: 'Rich arabica double pull with smooth golden crema.',
      price: 180.0,
      stockQty: 85,
      lowStockThreshold: 20,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'coldBrew',
      name: 'Iced Cold Brew Latte',
      category: MenuCategory.beverage,
      description: '18-hour slow steeped cold brew with whole oat milk.',
      price: 240.0,
      stockQty: 42,
      lowStockThreshold: 15,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'proteinShake',
      name: 'Pro Whey Banana Shake',
      category: MenuCategory.beverage,
      description: '30g whey isolate, ripe bananas, almond butter & chia seeds.',
      price: 320.0,
      stockQty: 30,
      lowStockThreshold: 10,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'orangeJuice',
      name: 'Fresh Valencia Orange Juice',
      category: MenuCategory.beverage,
      description: 'Cold pressed 100% natural Valencia oranges without added sugar.',
      price: 210.0,
      stockQty: 18,
      lowStockThreshold: 10,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'mineralWater',
      name: 'Sparkling Mineral Water (750ml)',
      category: MenuCategory.beverage,
      description: 'Imported crisp carbonated spring water served chilled with lemon wedge.',
      price: 150.0,
      stockQty: 60,
      lowStockThreshold: 20,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'electrolyteBerry',
      name: 'Electrolyte Berry Hydration Drink',
      category: MenuCategory.beverage,
      description: 'Optimal isotonic blend with magnesium, sodium, potassium and wild berry infusion.',
      price: 190.0,
      stockQty: 50,
      lowStockThreshold: 15,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'mojito',
      name: 'Classic Virgin Mojito',
      category: MenuCategory.beverage,
      description: 'Fresh muddled garden mint, zesty lime wedges, raw cane syrup and club soda.',
      price: 260.0,
      stockQty: 40,
      lowStockThreshold: 10,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'sandwich',
      name: 'Champions Club Triple Sandwich',
      category: MenuCategory.food,
      description: 'Grilled smoked chicken, cheddar, organic tomatoes, avocado spread on sourdough.',
      price: 390.0,
      stockQty: 24,
      lowStockThreshold: 8,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'wrapPaneer',
      name: 'Tandoori Paneer Multigrain Wrap',
      category: MenuCategory.food,
      description: 'Marinated cottage cheese, bell peppers, mint yogurt dressing in flax wrap.',
      price: 340.0,
      stockQty: 19,
      lowStockThreshold: 6,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'quinoaBowl',
      name: 'High-Protein Quinoa Chicken Bowl',
      category: MenuCategory.food,
      description: 'Roasted chicken breast, organic quinoa, edamame, kale, lemon herb vinaigrette.',
      price: 460.0,
      stockQty: 12,
      lowStockThreshold: 5,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'greekSalad',
      name: 'Mediterranean Greek Salad',
      category: MenuCategory.food,
      description: 'Crisp cucumbers, kalamata olives, feta cheese cubes, extra virgin olive oil.',
      price: 310.0,
      stockQty: 15,
      lowStockThreshold: 5,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'salmon',
      name: 'Grilled Atlantic Salmon with Asparagus',
      category: MenuCategory.food,
      description: 'Pan-seared Norwegian salmon fillet, charred asparagus, lemon caper butter sauce.',
      price: 680.0,
      stockQty: 10,
      lowStockThreshold: 4,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'pastaArrabiata',
      name: 'Whole Wheat Penne Arrabiata',
      category: MenuCategory.food,
      description: 'Al dente durum wheat penne tossed in fiery San Marzano tomato & garlic sauce.',
      price: 360.0,
      stockQty: 20,
      lowStockThreshold: 6,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'truffleFries',
      name: 'Crispy Truffle Parmesan Fries',
      category: MenuCategory.snack,
      description: 'Skin-on golden potato fries tossed with white truffle oil and aged parmesan.',
      price: 250.0,
      stockQty: 35,
      lowStockThreshold: 10,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'nachos',
      name: 'Loaded Corn Nachos with Pico & Guac',
      category: MenuCategory.snack,
      description: 'Stone-ground tortilla chips, warm queso, house-made guacamole and salsa.',
      price: 280.0,
      stockQty: 22,
      lowStockThreshold: 8,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'trailPack',
      name: 'Raw Almonds & Cranberry Trail Pack',
      category: MenuCategory.snack,
      description: 'Roasted almonds, walnuts, pumpkin seeds and dried wild cranberries (100g).',
      price: 160.0,
      stockQty: 4,
      lowStockThreshold: 10,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'proteinBar',
      name: 'Dark Chocolate Protein Energy Bar',
      category: MenuCategory.snack,
      description: '70% Belgian dark chocolate coated whey crisp bar, 20g protein, zero added sugar.',
      price: 190.0,
      stockQty: 2,
      lowStockThreshold: 10,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1622484216258-6927d3122c54?w=500&auto=format&fit=crop&q=60',
    },
    {
      key: 'hummusPita',
      name: 'Hummus with Warm Zaatar Pita',
      category: MenuCategory.snack,
      description: 'Silky tahini chickpea dip drizzled with olive oil, paprika, and whole wheat pita.',
      price: 290.0,
      stockQty: 16,
      lowStockThreshold: 5,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const menuMap: Record<string, any> = {};
  for (const m of menuData) {
    const { key, ...data } = m;
    menuMap[key] = await prisma.menuItem.create({ data });
  }
  console.log(`✅ Seeded ${menuData.length} menu items`);

  // ==========================================
  // 8. BOOKINGS & PARTICIPANTS (10 bookings)
  // ==========================================
  console.log('📌 Seeding bookings and participants...');
  const bookingsData = [
    // 1. Roger Federer - Center Court 1 Clay morning session (Today)
    {
      key: 'bk1',
      courtId: courtMap.clay1.id,
      memberId: memberMap.roger.id,
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.member,
      slotStart: createDateTime(today, 10, 0),
      slotEnd: createDateTime(today, 11, 0),
      status: BookingStatus.confirmed,
      amountPaid: 200.0,
      paymentMethod: PaymentMethod.card,
      notes: 'Morning singles training session',
      participants: [{ memberId: memberMap.roger.id, guestName: null }],
    },
    // 2. Virat Kohli - Indoor Turf Cricket Net A (Today)
    {
      key: 'bk2',
      courtId: courtMap.netA.id,
      memberId: memberMap.virat.id,
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.member,
      slotStart: createDateTime(today, 11, 0),
      slotEnd: createDateTime(today, 12, 0),
      status: BookingStatus.confirmed,
      amountPaid: 200.0,
      paymentMethod: PaymentMethod.upi,
      notes: 'Batting nets session against bowling machine',
      participants: [{ memberId: memberMap.virat.id, guestName: null }],
    },
    // 3. Rafael Nadal - Grand Slam Court 2 Doubles (Today Afternoon)
    {
      key: 'bk3',
      courtId: courtMap.hard2.id,
      memberId: memberMap.rafa.id,
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.social,
      slotStart: createDateTime(today, 14, 0),
      slotEnd: createDateTime(today, 15, 30),
      status: BookingStatus.confirmed,
      amountPaid: 300.0,
      paymentMethod: PaymentMethod.card,
      notes: 'Competitive doubles practice with Carlos Alcaraz & guests',
      participants: [
        { memberId: memberMap.rafa.id, guestName: null },
        { memberId: memberMap.carlos.id, guestName: null },
        { memberId: null, guestName: 'Marc Lopez' },
        { memberId: null, guestName: 'David Ferrer' },
      ],
    },
    // 4. Rohit Sharma - Indoor Turf Cricket Net B (Today Evening)
    {
      key: 'bk4',
      courtId: courtMap.netB.id,
      memberId: memberMap.rohit.id,
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.member,
      slotStart: createDateTime(today, 16, 0),
      slotEnd: createDateTime(today, 17, 0),
      status: BookingStatus.confirmed,
      amountPaid: 250.0,
      paymentMethod: PaymentMethod.upi,
      notes: 'Net batting session with guest bowler',
      participants: [
        { memberId: memberMap.rohit.id, guestName: null },
        { memberId: null, guestName: 'Shreyas Iyer' },
      ],
    },
    // 5. Novak Djokovic - Center Court 1 Clay (Today Evening)
    {
      key: 'bk5',
      courtId: courtMap.clay1.id,
      memberId: memberMap.rahul.id, // Booked under Rahul Sharma's membership with coach Goran
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.member,
      slotStart: createDateTime(today, 17, 0),
      slotEnd: createDateTime(today, 18, 30),
      status: BookingStatus.confirmed,
      amountPaid: 300.0,
      paymentMethod: PaymentMethod.card,
      notes: 'Baseline rhythm drill session',
      participants: [
        { memberId: memberMap.rahul.id, guestName: null },
        { memberId: null, guestName: 'Goran Ivanisevic' },
      ],
    },
    // 6. Emma Raducanu - Grass Court 3 (Tomorrow Morning)
    {
      key: 'bk6',
      courtId: courtMap.lawn3.id,
      memberId: memberMap.emma.id,
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.member,
      slotStart: createDateTime(tomorrow, 9, 0),
      slotEnd: createDateTime(tomorrow, 10, 0),
      status: BookingStatus.confirmed,
      amountPaid: 250.0,
      paymentMethod: PaymentMethod.plan,
      notes: 'Lawn grass court footwork and volley warm-up',
      participants: [{ memberId: memberMap.emma.id, guestName: null }],
    },
    // 7. Non-member Walk-in Guest - Center Court 1 (Tomorrow Midday)
    {
      key: 'bk7',
      courtId: courtMap.clay1.id,
      memberId: null,
      guestName: 'Liam Hemsworth',
      guestPhone: '9870011223',
      bookingType: BookingType.walk_in,
      slotStart: createDateTime(tomorrow, 11, 0),
      slotEnd: createDateTime(tomorrow, 12, 0),
      status: BookingStatus.confirmed,
      amountPaid: 800.0,
      paymentMethod: PaymentMethod.cash,
      notes: 'Visitor day pass booking paid in cash at front desk',
      participants: [{ memberId: null, guestName: 'Liam Hemsworth' }],
    },
    // 8. Rahul Sharma - Corporate Cricket Friendly on Match Pitch (Tomorrow Evening)
    {
      key: 'bk8',
      courtId: courtMap.pitch1.id,
      memberId: memberMap.rahul.id,
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.social,
      slotStart: createDateTime(tomorrow, 17, 0),
      slotEnd: createDateTime(tomorrow, 20, 0),
      status: BookingStatus.confirmed,
      amountPaid: 1500.0,
      paymentMethod: PaymentMethod.card,
      notes: 'Floodlit evening T10 cricket friendly fixture',
      participants: [
        { memberId: memberMap.rahul.id, guestName: null },
        { memberId: memberMap.rohit.id, guestName: null },
        { memberId: null, guestName: 'Vikram Malhotra' },
        { memberId: null, guestName: 'Karan Johar' },
      ],
    },
    // 9. Serena Williams - Center Court 1 Clay (Yesterday Completed)
    {
      key: 'bk9',
      courtId: courtMap.clay1.id,
      memberId: memberMap.serena.id,
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.member,
      slotStart: createDateTime(yesterday, 10, 0),
      slotEnd: createDateTime(yesterday, 11, 0),
      status: BookingStatus.confirmed,
      amountPaid: 200.0,
      paymentMethod: PaymentMethod.card,
      notes: 'Completed session; serve placement training',
      participants: [{ memberId: memberMap.serena.id, guestName: null }],
    },
    // 10. Rahul Sharma - Grand Slam Court 2 (Yesterday Cancelled)
    {
      key: 'bk10',
      courtId: courtMap.hard2.id,
      memberId: memberMap.rahul.id,
      guestName: null,
      guestPhone: null,
      bookingType: BookingType.member,
      slotStart: createDateTime(yesterday, 16, 0),
      slotEnd: createDateTime(yesterday, 17, 0),
      status: BookingStatus.cancelled,
      amountPaid: 0.0,
      paymentMethod: null,
      notes: 'Member called to reschedule due to flight delay',
      participants: [{ memberId: memberMap.rahul.id, guestName: null }],
    },
  ];

  const bookingMap: Record<string, any> = {};
  for (const b of bookingsData) {
    const { key, participants, ...bookingFields } = b;
    const booking = await prisma.booking.create({
      data: {
        ...bookingFields,
        participants: {
          create: participants,
        },
      },
    });
    bookingMap[key] = booking;
  }
  console.log(`✅ Seeded ${bookingsData.length} bookings with participants`);

  // ==========================================
  // 9. BAR TABS & ITEMS (5 tabs)
  // ==========================================
  console.log('📌 Seeding bar tabs and tab items...');
  const tabsData = [
    // Tab 1: Table T-02 - Roger Federer (Open)
    {
      key: 'tab1',
      barTableId: tableMap.t2.id,
      memberId: memberMap.roger.id,
      openedBy: staffMap.bar1.id, // Alex Mercer
      status: TabStatus.open,
      openedAt: new Date(now.getTime() - 45 * 60 * 1000), // 45m ago
      settledAt: null,
      notes: 'Courtside terrace table; member requesting quick serve.',
      items: [
        { menuItemId: menuMap.coldBrew.id, qty: 2, unitPrice: 240.0, subtotal: 480.0 },
        { menuItemId: menuMap.sandwich.id, qty: 1, unitPrice: 390.0, subtotal: 390.0 },
        { menuItemId: menuMap.truffleFries.id, qty: 1, unitPrice: 250.0, subtotal: 250.0 },
      ],
    },
    // Tab 2: Table T-04 - Walk-in Guest (Open)
    {
      key: 'tab2',
      barTableId: tableMap.t4.id,
      memberId: null,
      openedBy: staffMap.bar2.id, // Priya Nair
      status: TabStatus.open,
      openedAt: new Date(now.getTime() - 25 * 60 * 1000), // 25m ago
      settledAt: null,
      notes: 'Guest after cricket nets practice.',
      items: [
        { menuItemId: menuMap.proteinShake.id, qty: 2, unitPrice: 320.0, subtotal: 640.0 },
        { menuItemId: menuMap.nachos.id, qty: 1, unitPrice: 280.0, subtotal: 280.0 },
      ],
    },
    // Tab 3: Lounge-01 - Virat Kohli (Open)
    {
      key: 'tab3',
      barTableId: tableMap.lounge1.id,
      memberId: memberMap.virat.id,
      openedBy: staffMap.bar1.id, // Alex Mercer
      status: TabStatus.open,
      openedAt: new Date(now.getTime() - 15 * 60 * 1000), // 15m ago
      settledAt: null,
      notes: 'Post-net session drinks & healthy recovery bowls.',
      items: [
        { menuItemId: menuMap.electrolyteBerry.id, qty: 2, unitPrice: 190.0, subtotal: 380.0 },
        { menuItemId: menuMap.quinoaBowl.id, qty: 2, unitPrice: 460.0, subtotal: 920.0 },
        { menuItemId: menuMap.proteinBar.id, qty: 2, unitPrice: 190.0, subtotal: 380.0 },
      ],
    },
    // Tab 4: Table T-01 - Rafael Nadal (Settled Today)
    {
      key: 'tab4',
      barTableId: tableMap.t1.id,
      memberId: memberMap.rafa.id,
      openedBy: staffMap.bar2.id, // Priya Nair
      status: TabStatus.settled,
      openedAt: new Date(now.getTime() - 3 * 3600 * 1000), // 3h ago
      settledAt: new Date(now.getTime() - 2 * 3600 * 1000), // 2h ago
      notes: 'Settled via member card on file.',
      items: [
        { menuItemId: menuMap.orangeJuice.id, qty: 2, unitPrice: 210.0, subtotal: 420.0 },
        { menuItemId: menuMap.greekSalad.id, qty: 1, unitPrice: 310.0, subtotal: 310.0 },
        { menuItemId: menuMap.trailPack.id, qty: 1, unitPrice: 160.0, subtotal: 160.0 },
      ],
    },
    // Tab 5: Table T-06 - Rohit Sharma & Guests (Settled Yesterday)
    {
      key: 'tab5',
      barTableId: tableMap.t6.id,
      memberId: memberMap.rohit.id,
      openedBy: staffMap.bar1.id, // Alex Mercer
      status: TabStatus.settled,
      openedAt: createDateTime(yesterday, 19, 30),
      settledAt: createDateTime(yesterday, 21, 15),
      notes: 'Celebration dinner post match pitch fixture.',
      items: [
        { menuItemId: menuMap.mojito.id, qty: 4, unitPrice: 260.0, subtotal: 1040.0 },
        { menuItemId: menuMap.nachos.id, qty: 2, unitPrice: 280.0, subtotal: 560.0 },
        { menuItemId: menuMap.salmon.id, qty: 2, unitPrice: 680.0, subtotal: 1360.0 },
        { menuItemId: menuMap.pastaArrabiata.id, qty: 2, unitPrice: 360.0, subtotal: 720.0 },
      ],
    },
  ];

  const tabMap: Record<string, any> = {};
  for (const t of tabsData) {
    const { key, items, ...tabFields } = t;
    const tab = await prisma.barTab.create({
      data: {
        ...tabFields,
        items: {
          create: items,
        },
      },
    });
    tabMap[key] = tab;
  }
  console.log(`✅ Seeded ${tabsData.length} bar tabs with items`);

  // ==========================================
  // 10. ORDERS & ORDER ITEMS (6 orders)
  // ==========================================
  console.log('📌 Seeding orders and order items...');
  const ordersData = [
    // Order 1: In-store Pro Shop Purchase (Roger Federer) - Fulfilled
    {
      key: 'ord1',
      memberId: memberMap.roger.id,
      orderType: OrderType.in_store,
      status: OrderStatus.fulfilled,
      paymentMethod: PaymentMethod.card,
      subtotal: 28936.0,
      discountAmount: 4340.4, // 15% Gold discount
      totalAmount: 24595.6,
      deliveryAddress: null,
      createdAt: createDateTime(yesterday, 11, 20),
      equipmentItems: [
        { equipmentId: equipmentMap.racketWilson.id, qty: 1, unitPrice: 24999.0, subtotal: 24999.0 },
        { equipmentId: equipmentMap.ballsTennisSlazenger.id, qty: 2, unitPrice: 899.0, subtotal: 1798.0 },
        { equipmentId: equipmentMap.overgripTourna.id, qty: 1, unitPrice: 1899.0, subtotal: 1899.0 },
      ],
      menuItems: [
        { menuItemId: menuMap.coldBrew.id, qty: 1, unitPrice: 240.0, subtotal: 240.0 },
      ],
    },
    // Order 2: Online Delivery Order (Serena Williams) - Confirmed
    {
      key: 'ord2',
      memberId: memberMap.serena.id,
      orderType: OrderType.online,
      status: OrderStatus.confirmed,
      paymentMethod: PaymentMethod.card,
      subtotal: 17494.0,
      discountAmount: 2624.1, // 15% Gold discount
      totalAmount: 14869.9,
      deliveryAddress: '1401 Ocean Crest, Juhu Tara Road, Mumbai 400049',
      createdAt: createDateTime(today, 9, 30),
      equipmentItems: [
        { equipmentId: equipmentMap.shoesAsics.id, qty: 1, unitPrice: 13999.0, subtotal: 13999.0 },
        { equipmentId: equipmentMap.poloNike.id, qty: 1, unitPrice: 3495.0, subtotal: 3495.0 },
      ],
      menuItems: [],
    },
    // Order 3: Cricket Gear Purchase (Virat Kohli) - Fulfilled
    {
      key: 'ord3',
      memberId: memberMap.virat.id,
      orderType: OrderType.in_store,
      status: OrderStatus.fulfilled,
      paymentMethod: PaymentMethod.upi,
      subtotal: 40498.0,
      discountAmount: 6074.7, // 15% Gold discount
      totalAmount: 34423.3,
      deliveryAddress: null,
      createdAt: createDateTime(yesterday, 16, 45),
      equipmentItems: [
        { equipmentId: equipmentMap.cricketBatTon.id, qty: 1, unitPrice: 28500.0, subtotal: 28500.0 },
        { equipmentId: equipmentMap.ballCricketKookaburra.id, qty: 2, unitPrice: 4499.0, subtotal: 8998.0 },
        { equipmentId: equipmentMap.ballCricketSG.id, qty: 4, unitPrice: 750.0, subtotal: 3000.0 },
      ],
      menuItems: [],
    },
    // Order 4: Online Racket Order (Emma Raducanu) - Pending
    {
      key: 'ord4',
      memberId: memberMap.emma.id,
      orderType: OrderType.online,
      status: OrderStatus.pending,
      paymentMethod: PaymentMethod.upi,
      subtotal: 25196.0,
      discountAmount: 2519.6, // 10% Silver discount
      totalAmount: 22676.4,
      deliveryAddress: 'Lake Castle 702, Hiranandani Gardens, Powai, Mumbai 400076',
      createdAt: new Date(now.getTime() - 2 * 3600 * 1000), // 2 hours ago
      equipmentItems: [
        { equipmentId: equipmentMap.racketHead.id, qty: 1, unitPrice: 22499.0, subtotal: 22499.0 },
        { equipmentId: equipmentMap.ballsTennisSlazenger.id, qty: 3, unitPrice: 899.0, subtotal: 2697.0 },
      ],
      menuItems: [],
    },
    // Order 5: Cafe Bar Order (Carlos Alcaraz) - Fulfilled
    {
      key: 'ord5',
      memberId: memberMap.carlos.id,
      orderType: OrderType.bar,
      status: OrderStatus.fulfilled,
      paymentMethod: PaymentMethod.cash,
      subtotal: 830.0,
      discountAmount: 41.5, // 5% Junior discount
      totalAmount: 788.5,
      deliveryAddress: null,
      createdAt: createDateTime(today, 12, 15),
      equipmentItems: [],
      menuItems: [
        { menuItemId: menuMap.sandwich.id, qty: 1, unitPrice: 390.0, subtotal: 390.0 },
        { menuItemId: menuMap.truffleFries.id, qty: 1, unitPrice: 250.0, subtotal: 250.0 },
        { menuItemId: menuMap.electrolyteBerry.id, qty: 1, unitPrice: 190.0, subtotal: 190.0 },
      ],
    },
    // Order 6: Cancelled Online Order (Rahul Sharma) - Cancelled
    {
      key: 'ord6',
      memberId: memberMap.rahul.id,
      orderType: OrderType.online,
      status: OrderStatus.cancelled,
      paymentMethod: PaymentMethod.card,
      subtotal: 21999.0,
      discountAmount: 3299.85,
      totalAmount: 18699.15,
      deliveryAddress: 'Flat 402, Sunshine Heights, Worli Sea Face, Mumbai 400018',
      createdAt: createDateTime(yesterday, 14, 0),
      equipmentItems: [
        { equipmentId: equipmentMap.racketBabolat.id, qty: 1, unitPrice: 21999.0, subtotal: 21999.0 },
      ],
      menuItems: [],
    },
  ];

  const orderMap: Record<string, any> = {};
  for (const o of ordersData) {
    const { key, equipmentItems, menuItems, ...orderFields } = o;
    const order = await prisma.order.create({
      data: {
        ...orderFields,
        equipmentItems: {
          create: equipmentItems,
        },
        menuItems: {
          create: menuItems,
        },
      },
    });
    orderMap[key] = order;
  }
  console.log(`✅ Seeded ${ordersData.length} orders with equipment and menu lines`);

  // ==========================================
  // 11. LEADS (5 leads)
  // ==========================================
  console.log('📌 Seeding CRM leads...');
  const leadsData = [
    {
      name: 'Arjun Kapoor',
      email: 'arjun.k@outlook.com',
      phone: '9820123987',
      message: 'Looking for Gold family membership for myself, spouse, and 2 teenage children. Interested in weekend tennis coaching and cricket net access.',
      status: LeadStatus.new,
      assignedTo: staffMap.frontdesk1.id,
    },
    {
      name: 'TechVentures Pvt Ltd (Meera Nair - HR)',
      email: 'meera.nair@techventures.io',
      phone: '9833445566',
      message: 'Inquiry regarding corporate sports day package for 60 employees. Would like to book Center Court and both cricket nets for next month.',
      status: LeadStatus.contacted,
      assignedTo: staffMap.admin.id,
    },
    {
      name: 'Ramesh Sundaram',
      email: 'ramesh.s@gmail.com',
      phone: '9819283746',
      message: 'Junior summer training academy inquiry for 14-year-old son aspiring to play district level cricket.',
      status: LeadStatus.contacted,
      assignedTo: staffMap.frontdesk2.id,
    },
    {
      name: 'Siddharth Malhotra',
      email: 'sid.malhotra@zenith.com',
      phone: '9821098765',
      message: 'Trial session completed on clay court last Saturday. Ready to proceed with annual Silver membership.',
      status: LeadStatus.converted,
      assignedTo: staffMap.frontdesk1.id,
    },
    {
      name: 'Ananya Deshmukh',
      email: 'ananya.d@gmail.com',
      phone: '9820334455',
      message: 'Inquired about weekend badminton courts, but club currently focuses exclusively on tennis and cricket.',
      status: LeadStatus.lost,
      assignedTo: staffMap.frontdesk2.id,
    },
  ];

  for (const l of leadsData) {
    await prisma.lead.create({ data: l });
  }
  console.log(`✅ Seeded ${leadsData.length} leads`);

  // ==========================================
  // 12. SHIFTS (12 shifts)
  // ==========================================
  console.log('📌 Seeding staff shifts...');
  const shiftsData = [
    // Aarav Verma (Front Desk Lead)
    {
      staffId: staffMap.frontdesk1.id,
      shiftDate: yesterday,
      shiftStart: createDateTime(yesterday, 6, 0),
      shiftEnd: createDateTime(yesterday, 14, 30),
      notes: 'Morning shift completed; handoff to Sarah.',
    },
    {
      staffId: staffMap.frontdesk1.id,
      shiftDate: today,
      shiftStart: createDateTime(today, 6, 0),
      shiftEnd: createDateTime(today, 14, 30),
      notes: 'Morning check-ins smooth; clay court prepared.',
    },
    {
      staffId: staffMap.frontdesk1.id,
      shiftDate: tomorrow,
      shiftStart: createDateTime(tomorrow, 6, 0),
      shiftEnd: createDateTime(tomorrow, 14, 30),
      notes: 'Scheduled morning shift.',
    },
    // Sarah Jenkins (Front Desk Associate)
    {
      staffId: staffMap.frontdesk2.id,
      shiftDate: yesterday,
      shiftStart: createDateTime(yesterday, 14, 0),
      shiftEnd: createDateTime(yesterday, 22, 30),
      notes: 'Evening peak reception and court slot supervision.',
    },
    {
      staffId: staffMap.frontdesk2.id,
      shiftDate: today,
      shiftStart: createDateTime(today, 14, 0),
      shiftEnd: createDateTime(today, 22, 30),
      notes: 'Current afternoon & evening shift.',
    },
    {
      staffId: staffMap.frontdesk2.id,
      shiftDate: tomorrow,
      shiftStart: createDateTime(tomorrow, 14, 0),
      shiftEnd: createDateTime(tomorrow, 22, 30),
      notes: 'Scheduled evening shift.',
    },
    // Alex Mercer (Head Bartender & F&B)
    {
      staffId: staffMap.bar1.id,
      shiftDate: yesterday,
      shiftStart: createDateTime(yesterday, 15, 0),
      shiftEnd: createDateTime(yesterday, 23, 30),
      notes: 'Terrace lounge evening service completed.',
    },
    {
      staffId: staffMap.bar1.id,
      shiftDate: today,
      shiftStart: createDateTime(today, 15, 0),
      shiftEnd: createDateTime(today, 23, 30),
      notes: 'Evening bar shift active.',
    },
    {
      staffId: staffMap.bar1.id,
      shiftDate: tomorrow,
      shiftStart: createDateTime(tomorrow, 15, 0),
      shiftEnd: createDateTime(tomorrow, 23, 30),
      notes: 'Scheduled weekend terrace lounge shift.',
    },
    // Priya Nair (Bar / Cafe Staff)
    {
      staffId: staffMap.bar2.id,
      shiftDate: today,
      shiftStart: createDateTime(today, 10, 0),
      shiftEnd: createDateTime(today, 18, 30),
      notes: 'Day shift cafe & smoothies.',
    },
    // Marcus Taylor (Pro Shop Manager)
    {
      staffId: staffMap.shop1.id,
      shiftDate: today,
      shiftStart: createDateTime(today, 9, 0),
      shiftEnd: createDateTime(today, 18, 0),
      notes: 'Pro shop inventory audit and racket stringing requests.',
    },
    {
      staffId: staffMap.shop1.id,
      shiftDate: tomorrow,
      shiftStart: createDateTime(tomorrow, 9, 0),
      shiftEnd: createDateTime(tomorrow, 18, 0),
      notes: 'Scheduled pro shop shift.',
    },
  ];

  for (const s of shiftsData) {
    await prisma.shift.create({ data: s });
  }
  console.log(`✅ Seeded ${shiftsData.length} staff shifts`);

  // ==========================================
  // 13. LEAVE REQUESTS (3 requests)
  // ==========================================
  console.log('📌 Seeding leave requests...');
  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 4);

  const leaveRequestsData = [
    {
      staffId: staffMap.frontdesk2.id, // Sarah Jenkins
      fromDate: nextWeekStart,
      toDate: nextWeekEnd,
      reason: 'Annual family vacation; shift coverage arranged with Aarav Verma.',
      status: LeaveStatus.approved,
      reviewedBy: staffMap.admin.id,
      reviewedAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000), // 2 days ago
    },
    {
      staffId: staffMap.bar2.id, // Priya Nair
      fromDate: tomorrow,
      toDate: tomorrow,
      reason: 'Scheduled routine medical appointment and follow-up consultation.',
      status: LeaveStatus.pending,
      reviewedBy: null,
      reviewedAt: null,
    },
    {
      staffId: staffMap.shop2.id, // Vikram Roy
      fromDate: createDateTime(yesterday, 0, 0),
      toDate: createDateTime(yesterday, 0, 0),
      reason: 'Short notice personal leave requested for family function.',
      status: LeaveStatus.rejected,
      reviewedBy: staffMap.admin.id,
      reviewedAt: createDateTime(yesterday, 8, 0),
    },
  ];

  for (const lr of leaveRequestsData) {
    await prisma.leaveRequest.create({ data: lr });
  }
  console.log(`✅ Seeded ${leaveRequestsData.length} leave requests`);

  // ==========================================
  // 14. PAYMENTS (11 transactions)
  // ==========================================
  console.log('📌 Seeding payment transactions...');
  const paymentsData = [
    // 1. Booking 1 Payment (Roger Federer - Center Court Clay)
    {
      memberId: memberMap.roger.id,
      bookingId: bookingMap.bk1.id,
      orderId: null,
      barTabId: null,
      amount: 200.0,
      paymentMethod: PaymentMethod.card,
      referenceNo: 'TXN-BK-2026-8819',
      notes: 'Center Court 1 hour clay court reservation fee',
      paidAt: createDateTime(today, 9, 55),
    },
    // 2. Booking 2 Payment (Virat Kohli - Cricket Net A)
    {
      memberId: memberMap.virat.id,
      bookingId: bookingMap.bk2.id,
      orderId: null,
      barTabId: null,
      amount: 200.0,
      paymentMethod: PaymentMethod.upi,
      referenceNo: 'UPI-BK-992147@axl',
      notes: 'Indoor turf cricket net session booking',
      paidAt: createDateTime(today, 10, 48),
    },
    // 3. Booking 3 Payment (Rafael Nadal - Doubles Session)
    {
      memberId: memberMap.rafa.id,
      bookingId: bookingMap.bk3.id,
      orderId: null,
      barTabId: null,
      amount: 300.0,
      paymentMethod: PaymentMethod.card,
      referenceNo: 'TXN-BK-2026-9042',
      notes: 'Grand Slam Court 2 90-minute doubles fixture',
      paidAt: createDateTime(today, 13, 50),
    },
    // 4. Booking 7 Payment (Liam Hemsworth - Non-Member Walk-in)
    {
      memberId: null,
      bookingId: bookingMap.bk7.id,
      orderId: null,
      barTabId: null,
      amount: 800.0,
      paymentMethod: PaymentMethod.cash,
      referenceNo: 'REC-CSH-7812',
      notes: 'Non-member guest court rate collected at front desk',
      paidAt: createDateTime(today, 11, 10),
    },
    // 5. Booking 8 Payment (Rahul Sharma - Floodlit Match Pitch Friendly)
    {
      memberId: memberMap.rahul.id,
      bookingId: bookingMap.bk8.id,
      orderId: null,
      barTabId: null,
      amount: 1500.0,
      paymentMethod: PaymentMethod.card,
      referenceNo: 'TXN-BK-2026-9500',
      notes: 'Match pitch 3-hour floodlit slot booking deposit',
      paidAt: createDateTime(today, 15, 20),
    },
    // 6. Order 1 Payment (Roger Federer - Pro Shop Equipment)
    {
      memberId: memberMap.roger.id,
      bookingId: null,
      orderId: orderMap.ord1.id,
      barTabId: null,
      amount: 24595.6,
      paymentMethod: PaymentMethod.card,
      referenceNo: 'TXN-ORD-2026-1001',
      notes: 'Pro shop equipment purchase (Wilson racket + balls + overgrips + cold brew)',
      paidAt: createDateTime(yesterday, 11, 45),
    },
    // 7. Order 2 Payment (Serena Williams - Online Shoes & Polo)
    {
      memberId: memberMap.serena.id,
      bookingId: null,
      orderId: orderMap.ord2.id,
      barTabId: null,
      amount: 14869.9,
      paymentMethod: PaymentMethod.card,
      referenceNo: 'TXN-ORD-2026-1002',
      notes: 'Online store checkout (Asics clay shoes + Nike polo)',
      paidAt: createDateTime(today, 9, 35),
    },
    // 8. Order 3 Payment (Virat Kohli - Match Cricket Equipment)
    {
      memberId: memberMap.virat.id,
      bookingId: null,
      orderId: orderMap.ord3.id,
      barTabId: null,
      amount: 34423.3,
      paymentMethod: PaymentMethod.upi,
      referenceNo: 'UPI-ORD-449102@paytm',
      notes: 'SS English willow bat and match cricket balls batch',
      paidAt: createDateTime(yesterday, 17, 0),
    },
    // 9. Order 5 Payment (Carlos Alcaraz - Cafe Order)
    {
      memberId: memberMap.carlos.id,
      bookingId: null,
      orderId: orderMap.ord5.id,
      barTabId: null,
      amount: 788.5,
      paymentMethod: PaymentMethod.cash,
      referenceNo: 'REC-CSH-5510',
      notes: 'Bar & cafe post-training meal paid in cash',
      paidAt: createDateTime(today, 12, 30),
    },
    // 10. Bar Tab 4 Payment (Rafael Nadal - Settled Terrace Tab)
    {
      memberId: memberMap.rafa.id,
      bookingId: null,
      orderId: null,
      barTabId: tabMap.tab4.id,
      amount: 890.0,
      paymentMethod: PaymentMethod.card,
      referenceNo: 'TXN-BAR-66291',
      notes: 'Settled bar tab Table T-01 (Orange juice, greek salad, trail pack)',
      paidAt: new Date(now.getTime() - 2 * 3600 * 1000),
    },
    // 11. Bar Tab 5 Payment (Rohit Sharma - Settled Table T-06 Celebration)
    {
      memberId: memberMap.rohit.id,
      bookingId: null,
      orderId: null,
      barTabId: tabMap.tab5.id,
      amount: 3680.0,
      paymentMethod: PaymentMethod.upi,
      referenceNo: 'UPI-BAR-882711@okhdfc',
      notes: 'Settled bar tab Table T-06 (Evening terrace dinner with salmon & pasta)',
      paidAt: createDateTime(yesterday, 21, 15),
    },
    // 12. Membership Annual Subscription Fee (Rahul Sharma)
    {
      memberId: memberMap.rahul.id,
      bookingId: null,
      orderId: null,
      barTabId: null,
      amount: 50000.0,
      paymentMethod: PaymentMethod.card,
      referenceNo: 'MEM-RENEW-GOLD-2026',
      notes: 'Annual Gold Membership 12-Month Renewal Subscription',
      paidAt: oneYearAgo,
    },
  ];

  for (const p of paymentsData) {
    await prisma.payment.create({ data: p });
  }
  console.log(`✅ Seeded ${paymentsData.length} payment transactions`);

  console.log('\n=========================================');
  console.log('✨ CHAMPIONS CLUB SEED COMPLETED SUCCESSFULLY!');
  console.log('=========================================');
  console.log('Summary of seeded tables:');
  console.log(`• Membership Plans:      ${plansData.length}`);
  console.log(`• Staff:                 ${staffRecords.length}`);
  console.log(`• Members:               ${membersData.length}`);
  console.log(`• Member Addresses:      ${membersData.length}`);
  console.log(`• Courts:                ${courtsData.length}`);
  console.log(`• Bar Tables:            ${tablesData.length}`);
  console.log(`• Equipment Items:       ${equipmentData.length}`);
  console.log(`• Menu Items:            ${menuData.length}`);
  console.log(`• Bookings:              ${bookingsData.length}`);
  console.log(`• Booking Participants:  ${bookingsData.reduce((acc, b) => acc + b.participants.length, 0)}`);
  console.log(`• Bar Tabs:              ${tabsData.length}`);
  console.log(`• Bar Tab Items:         ${tabsData.reduce((acc, t) => acc + t.items.length, 0)}`);
  console.log(`• Orders:                ${ordersData.length}`);
  console.log(`• Order Equip Lines:     ${ordersData.reduce((acc, o) => acc + o.equipmentItems.length, 0)}`);
  console.log(`• Order Menu Lines:      ${ordersData.reduce((acc, o) => acc + o.menuItems.length, 0)}`);
  console.log(`• Leads:                 ${leadsData.length}`);
  console.log(`• Shifts:                ${shiftsData.length}`);
  console.log(`• Leave Requests:        ${leaveRequestsData.length}`);
  console.log(`• Payments:              ${paymentsData.length}`);
  console.log('=========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
