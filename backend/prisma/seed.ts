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

// Helper to construct dates at specific hours
function createDateTime(baseDate: Date, hours: number, minutes = 0) {
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Helper to add days
function addDays(baseDate: Date, days: number) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('🌱 Starting comprehensive database seed for Champions Sports Club...');

  // ==========================================
  // 0. CLEANUP EXISTING DATA (Reverse FK order)
  // ==========================================
  console.log('🧹 Cleaning up existing records in reverse dependency order...');
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

  // Pre-hashed passwords for performance
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const staffPassword = await bcrypt.hash('Staff@12345', 10);
  const memberPassword = await bcrypt.hash('Member@12345', 10);

  // Reference base date
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ==========================================
  // 1. MEMBERSHIP PLANS (330 rows)
  // ==========================================
  console.log('📌 Seeding 330 membership plans...');
  const plansData: Array<{
    tier: MembershipTier;
    durationMonths: number;
    price: number;
    courtRate: number;
    shopDiscountPct: number;
    barDiscountPct: number;
    isActive: boolean;
  }> = [];

  const tiers = [MembershipTier.Gold, MembershipTier.Silver, MembershipTier.Junior];
  for (const tier of tiers) {
    for (let month = 1; month <= 110; month++) {
      let baseMonthlyPrice = 5000;
      let baseCourtRate = 200;
      let shopDisc = 15;
      let barDisc = 15;

      if (tier === MembershipTier.Silver) {
        baseMonthlyPrice = 3000;
        baseCourtRate = 300;
        shopDisc = 10;
        barDisc = 5;
      } else if (tier === MembershipTier.Junior) {
        baseMonthlyPrice = 2000;
        baseCourtRate = 220;
        shopDisc = 5;
        barDisc = 5;
      }

      // Volume discount scaling with duration
      const durationFactor = Math.max(0.7, 1 - month * 0.003);
      const price = Math.round(baseMonthlyPrice * month * durationFactor);
      const courtRate = Math.max(100, Math.round(baseCourtRate * durationFactor));

      plansData.push({
        tier,
        durationMonths: month,
        price,
        courtRate,
        shopDiscountPct: shopDisc,
        barDiscountPct: barDisc,
        isActive: month <= 36 || month % 6 === 0,
      });
    }
  }

  await prisma.membershipPlan.createMany({ data: plansData });
  console.log(`✅ Seeded ${plansData.length} membership plans`);

  // ==========================================
  // 2. STAFF (330 rows)
  // ==========================================
  console.log('📌 Seeding 330 staff members...');
  const firstNamesPool = [
    'Aarav', 'Sarah', 'Alex', 'Priya', 'Marcus', 'Vikram', 'Ananya', 'Arjun', 'Siddharth', 'Meera',
    'Ramesh', 'Divya', 'Rohan', 'Neha', 'Aditya', 'Sneha', 'Kabir', 'Riya', 'Aryan', 'Tanvi',
    'Kunal', 'Pooja', 'Ishaan', 'Kavya', 'Dev', 'Shreya', 'Arman', 'Anjali', 'Varun', 'Mehak',
    'Yash', 'Natasha', 'Karan', 'Simran', 'Tarun', 'Alisha', 'Sameer', 'Kriti', 'Gaurav', 'Radhika',
    'Nikhil', 'Bhavna', 'Rishabh', 'Trisha', 'Manan', 'Sonali', 'Ayush', 'Ritu', 'Pranav', 'Swati',
    'Deep', 'Payal', 'Harsh', 'Diya', 'Mayank', 'Sanya', 'Vivek', 'Pallavi', 'Abhay', 'Nidhi',
    'Akhil', 'Shilpa', 'Chetan', 'Leena', 'Ashish', 'Jyoti', 'Mohit', 'Preeti', 'Chirag', 'Aarti',
    'Saurabh', 'Rashi', 'Tushar', 'Barkha', 'Uday', 'Mallika', 'Sunny', 'Garima', 'Hemant', 'Monisha',
    'Pankaj', 'Komal', 'David', 'Elena', 'Marco', 'Chloe', 'Lucas', 'Emma', 'Daniel', 'Sophie',
    'Liam', 'Olivia', 'Noah', 'Mia', 'Oliver', 'Amelia', 'Ethan', 'Harper', 'James', 'Evelyn'
  ];

  const lastNamesPool = [
    'Verma', 'Jenkins', 'Mercer', 'Nair', 'Taylor', 'Roy', 'Singh', 'Gupta', 'Kapoor', 'Deshmukh',
    'Malhotra', 'Sundaram', 'Iyer', 'Mukherjee', 'Chatterjee', 'Banerjee', 'Bose', 'Sen', 'Das', 'Dutta',
    'Ghosh', 'Paul', 'Mehta', 'Shah', 'Joshi', 'Kulkarni', 'Deshpande', 'Patil', 'Shinde', 'Pawar',
    'Jadhav', 'More', 'Agarwal', 'Mittal', 'Bansal', 'Goel', 'Singhal', 'Garg', 'Jindal', 'Jain',
    'Goyal', 'Maheshwari', 'Reddy', 'Rao', 'Naidu', 'Chowdary', 'Murthy', 'Bhat', 'Hegde', 'Kamath',
    'Pai', 'Prabhu', 'Menon', 'Pillai', 'Nambiar', 'Kurian', 'George', 'Thomas', 'Mathew', 'Varghese',
    'Chacko', 'Khan', 'Ali', 'Ahmed', 'Sheikh', 'Ansari', 'Qureshi', 'Siddiqui', 'Mirza', 'Baig',
    'Chopra', 'Khanna', 'Dhawan', 'Grover', 'Anand', 'Sethi', 'Bhasin', 'Suri', 'Sahni', 'Bakshi',
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Thomas'
  ];

  const staffData: Array<{
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: StaffRole;
    phone: string;
    salary: number;
    isActive: boolean;
  }> = [];

  // Seed primary key staff accounts
  staffData.push({
    firstName: 'Club',
    lastName: 'Manager',
    email: 'admin@championsclub.com',
    passwordHash: adminPassword,
    role: StaffRole.admin,
    phone: '9876543210',
    salary: 95000,
    isActive: true,
  });

  const rolesDistribution: StaffRole[] = [
    StaffRole.admin,
    StaffRole.front_desk,
    StaffRole.front_desk,
    StaffRole.bar,
    StaffRole.bar,
    StaffRole.shop,
    StaffRole.shop,
  ];

  for (let i = 1; i < 330; i++) {
    const fn = firstNamesPool[i % firstNamesPool.length];
    const ln = lastNamesPool[(i * 3 + 7) % lastNamesPool.length];
    const role = rolesDistribution[i % rolesDistribution.length];

    let salary = 36000;
    if (role === StaffRole.admin) salary = 75000 + (i % 25) * 1000;
    else if (role === StaffRole.front_desk) salary = 34000 + (i % 15) * 800;
    else if (role === StaffRole.bar) salary = 32000 + (i % 18) * 750;
    else if (role === StaffRole.shop) salary = 30000 + (i % 16) * 700;

    staffData.push({
      firstName: fn,
      lastName: ln,
      email: `staff.${fn.toLowerCase()}.${ln.toLowerCase()}.${i}@championsclub.com`,
      passwordHash: staffPassword,
      role,
      phone: `98${String(10000000 + i).slice(-8)}`,
      salary,
      isActive: i % 25 !== 0,
    });
  }

  await prisma.staff.createMany({ data: staffData });
  const staffList = await prisma.staff.findMany({ select: { id: true, role: true } });
  console.log(`✅ Seeded ${staffList.length} staff members`);

  // ==========================================
  // 3. MEMBERS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 club members...');
  const memberFirstNames = [
    'Rahul', 'Priya', 'Roger', 'Serena', 'Rafael', 'Virat', 'Rohit', 'Emma', 'Carlos', 'Novak',
    'Daniil', 'Stefanos', 'Jannik', 'Aryna', 'Iga', 'Coco', 'Elena', 'Casper', 'Holger', 'Taylor',
    'Andrey', 'Hubert', 'Frances', 'Ben', 'Ons', 'Jessica', 'Maria', 'Naomi', 'Dominic', 'Kei',
    'Milos', 'Grigor', 'David', 'Andy', 'Stan', 'Marin', 'Jo-Wilfried', 'Gael', 'Tomas', 'Juan',
    'Sachin', 'Sourav', 'Anil', 'Zaheer', 'Yuvraj', 'Harbhajan', 'Virender', 'Gautam', 'Suresh', 'Ashwin',
    'Ravindra', 'Jasprit', 'Shikhar', 'Ajinkya', 'Hardik', 'Rishabh', 'Shubman', 'Ishan', 'Suryakumar', 'KL',
    'Sanath', 'Brian', 'Ricky', 'Jacques', 'Shane', 'Wasim', 'Waqar', 'Shoaib', 'Inzamam', 'Mutthiah',
    'Arjun', 'Kabir', 'Ayaan', 'Vihaan', 'Reyansh', 'Shaurya', 'Aarush', 'Atharv', 'Advik', 'Vivaan',
    'Ananya', 'Diya', 'Myra', 'Ira', 'Avani', 'Aditi', 'Prisha', 'Siya', 'Shanaya', 'Kashvi',
    'Ishaan', 'Dhruv', 'Darsh', 'Kian', 'Samar', 'Devansh', 'Hridaan', 'Rudra', 'Vedant', 'Samarth'
  ];

  const memberLastNames = [
    'Sharma', 'Patel', 'Federer', 'Williams', 'Nadal', 'Kohli', 'Raducanu', 'Alcaraz', 'Djokovic', 'Medvedev',
    'Tsitsipas', 'Sinner', 'Sabalenka', 'Swiatek', 'Gauff', 'Rybakina', 'Ruud', 'Rune', 'Fritz', 'Rublev',
    'Hurkacz', 'Tiafoe', 'Shelton', 'Jabeur', 'Pegula', 'Sharapova', 'Osaka', 'Thiem', 'Nishikori', 'Raonic',
    'Dimitrov', 'Ferrer', 'Murray', 'Wawrinka', 'Cilic', 'Tsonga', 'Monfils', 'Berdych', 'del Potro', 'Tendulkar',
    'Ganguly', 'Kumble', 'Khan', 'Singh', 'Harbhajan', 'Sehwag', 'Gambhir', 'Raina', 'Ashwin', 'Jadeja',
    'Bumrah', 'Dhawan', 'Rahane', 'Pandya', 'Pant', 'Gill', 'Kishan', 'Yadav', 'Rahul', 'Jayasuriya',
    'Lara', 'Ponting', 'Kallis', 'Warne', 'Akram', 'Younis', 'Akhtar', 'ul-Haq', 'Muralitharan', 'Kapoor',
    'Deshmukh', 'Malhotra', 'Sundaram', 'Iyer', 'Mukherjee', 'Mehta', 'Shah', 'Joshi', 'Kulkarni', 'Reddy',
    'Murthy', 'Kamath', 'Menon', 'Nambiar', 'Chopra', 'Khanna', 'Dhawan', 'Grover', 'Anand', 'Sethi'
  ];

  const membersData: Array<{
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone: string;
    dateOfBirth: Date;
    tier: MembershipTier;
    membershipStart: Date;
    membershipEnd: Date;
    status: MembershipStatus;
    photoUrl: string;
  }> = [];

  const tierCycle = [MembershipTier.Gold, MembershipTier.Silver, MembershipTier.Gold, MembershipTier.Silver, MembershipTier.Junior];
  const photoAvatars = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
  ];

  for (let i = 0; i < 350; i++) {
    const fn = memberFirstNames[i % memberFirstNames.length];
    const ln = memberLastNames[(i * 2 + 5) % memberLastNames.length];
    const tier = tierCycle[i % tierCycle.length];
    const isJunior = tier === MembershipTier.Junior;

    const birthYear = isJunior ? 2008 + (i % 6) : 1970 + (i % 32);
    const dob = new Date(birthYear, (i * 3) % 12, 1 + (i % 28));

    const isExpired = i % 14 === 0;
    const mStart = isExpired ? addDays(today, -400) : addDays(today, -(i * 2));
    const mEnd = isExpired ? addDays(today, -30) : addDays(today, 180 + (i % 180));

    membersData.push({
      firstName: fn,
      lastName: ln,
      email: `member.${fn.toLowerCase()}.${ln.toLowerCase()}.${i + 1}@championsclub.com`,
      passwordHash: memberPassword,
      phone: `98${String(20000000 + i).slice(-8)}`,
      dateOfBirth: dob,
      tier,
      membershipStart: mStart,
      membershipEnd: mEnd,
      status: isExpired ? MembershipStatus.expired : MembershipStatus.active,
      photoUrl: photoAvatars[i % photoAvatars.length],
    });
  }

  await prisma.member.createMany({ data: membersData });
  const memberList = await prisma.member.findMany({ select: { id: true, tier: true, firstName: true, lastName: true } });
  console.log(`✅ Seeded ${memberList.length} members`);

  // ==========================================
  // 4. MEMBER ADDRESSES (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 member addresses...');
  const localities = [
    { area: 'Worli Sea Face', city: 'Mumbai', state: 'Maharashtra', pin: '400018' },
    { area: 'Pali Hill, Bandra West', city: 'Mumbai', state: 'Maharashtra', pin: '400050' },
    { area: 'Juhu Tara Road', city: 'Mumbai', state: 'Maharashtra', pin: '400049' },
    { area: 'Hiranandani Gardens, Powai', city: 'Mumbai', state: 'Maharashtra', pin: '400076' },
    { area: 'Lodha Bellissimo, Mahalaxmi', city: 'Mumbai', state: 'Maharashtra', pin: '400011' },
    { area: 'Koregaon Park, Lane 7', city: 'Pune', state: 'Maharashtra', pin: '411001' },
    { area: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pin: '411006' },
    { area: 'Vasant Vihar, Block C', city: 'New Delhi', state: 'Delhi', pin: '110057' },
    { area: 'Golf Links Enclave', city: 'New Delhi', state: 'Delhi', pin: '110003' },
    { area: 'Defence Colony', city: 'New Delhi', state: 'Delhi', pin: '110024' },
    { area: 'Indiranagar 100 Feet Road', city: 'Bengaluru', state: 'Karnataka', pin: '560038' },
    { area: 'Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', pin: '560034' },
    { area: 'Sadashivanagar', city: 'Bengaluru', state: 'Karnataka', pin: '560080' },
    { area: 'Jubilee Hills, Road No. 36', city: 'Hyderabad', state: 'Telangana', pin: '500033' },
    { area: 'Banjara Hills, Road No. 12', city: 'Hyderabad', state: 'Telangana', pin: '500034' },
    { area: 'Boat Club Road', city: 'Chennai', state: 'Tamil Nadu', pin: '600028' },
    { area: 'Poes Garden', city: 'Chennai', state: 'Tamil Nadu', pin: '600086' },
    { area: 'Alwarpet', city: 'Chennai', state: 'Tamil Nadu', pin: '600018' },
  ];

  const addressesData: Array<{
    memberId: number;
    addrLine1: string;
    addrLine2: string;
    city: string;
    state: string;
    pincode: string;
  }> = [];

  for (let i = 0; i < memberList.length; i++) {
    const loc = localities[i % localities.length];
    addressesData.push({
      memberId: memberList[i].id,
      addrLine1: `Flat ${101 + (i % 20) * 10}, Tower ${String.fromCharCode(65 + (i % 6))}`,
      addrLine2: loc.area,
      city: loc.city,
      state: loc.state,
      pincode: loc.pin,
    });
  }

  await prisma.memberAddress.createMany({ data: addressesData });
  console.log(`✅ Seeded ${addressesData.length} member addresses`);

  // ==========================================
  // 5. COURTS & PITCHES (330 rows)
  // ==========================================
  console.log('📌 Seeding 330 courts and sports facilities...');
  const courtsData: Array<{
    name: string;
    sport: SportType;
    openTime: string;
    closeTime: string;
    isActive: boolean;
  }> = [];

  const courtTemplates = [
    { prefix: 'Center Court (Clay)', sport: SportType.tennis, open: '06:00', close: '22:00' },
    { prefix: 'Grand Slam Arena (Hard)', sport: SportType.tennis, open: '06:00', close: '22:00' },
    { prefix: 'Wimbledon Grass Court', sport: SportType.tennis, open: '07:00', close: '20:00' },
    { prefix: 'Roland Garros Red Clay', sport: SportType.tennis, open: '06:00', close: '22:00' },
    { prefix: 'US Open DecoTurf', sport: SportType.tennis, open: '06:00', close: '23:00' },
    { prefix: 'Covered Indoor Court', sport: SportType.tennis, open: '05:30', close: '23:00' },
    { prefix: 'Academy Clay Court', sport: SportType.tennis, open: '06:00', close: '21:30' },
    { prefix: 'Floodlit Match Pitch', sport: SportType.cricket, open: '07:00', close: '22:30' },
    { prefix: 'Turf Match Ground', sport: SportType.cricket, open: '06:30', close: '21:00' },
    { prefix: 'Indoor Turf Cricket Net', sport: SportType.cricket, open: '06:00', close: '23:00' },
    { prefix: 'Outdoor AstroTurf Net', sport: SportType.cricket, open: '06:00', close: '22:00' },
    { prefix: 'Bowling Machine Lane', sport: SportType.cricket, open: '06:00', close: '22:00' },
  ];

  for (let i = 0; i < 330; i++) {
    const tmpl = courtTemplates[i % courtTemplates.length];
    const indexSuffix = Math.floor(i / courtTemplates.length) + 1;
    courtsData.push({
      name: `${tmpl.prefix} #${indexSuffix}`,
      sport: tmpl.sport,
      openTime: tmpl.open,
      closeTime: tmpl.close,
      isActive: i % 28 !== 0,
    });
  }

  await prisma.court.createMany({ data: courtsData });
  const courtList = await prisma.court.findMany({ select: { id: true, sport: true, name: true } });
  console.log(`✅ Seeded ${courtList.length} courts and cricket facilities`);

  // ==========================================
  // 6. BAR TABLES (330 rows)
  // ==========================================
  console.log('📌 Seeding 330 bar and terrace tables...');
  const barTablesData: Array<{
    tableNo: string;
    capacity: number;
    isActive: boolean;
  }> = [];

  const sections = [
    { prefix: 'T', count: 100, caps: [2, 4, 4, 6] },
    { prefix: 'L', count: 80, caps: [4, 6, 6, 8] },
    { prefix: 'B', count: 50, caps: [2, 2, 4, 4] },
    { prefix: 'R', count: 50, caps: [4, 6, 8, 10] },
    { prefix: 'V', count: 50, caps: [6, 8, 10, 12] },
  ];

  for (const sec of sections) {
    for (let i = 1; i <= sec.count; i++) {
      barTablesData.push({
        tableNo: `${sec.prefix}-${String(i).padStart(3, '0')}`,
        capacity: sec.caps[i % sec.caps.length],
        isActive: i % 35 !== 0,
      });
    }
  }

  await prisma.barTable.createMany({ data: barTablesData });
  const tableList = await prisma.barTable.findMany({ select: { id: true, tableNo: true } });
  console.log(`✅ Seeded ${tableList.length} bar and lounge tables`);

  // ==========================================
  // 7. EQUIPMENT ITEMS (330 rows)
  // ==========================================
  console.log('📌 Seeding 330 sports equipment products...');
  const equipmentTemplates = [
    // Rackets
    { name: 'Wilson Pro Staff 97 v14 Racket', cat: EquipmentCategory.racket, brand: 'Wilson', price: 24999, img: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8889?w=500' },
    { name: 'Babolat Pure Drive 2024', cat: EquipmentCategory.racket, brand: 'Babolat', price: 21999, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500' },
    { name: 'Head Speed Pro 2024 Novak Edition', cat: EquipmentCategory.racket, brand: 'Head', price: 22499, img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500' },
    { name: 'Yonex EZONE 98 Tour', cat: EquipmentCategory.racket, brand: 'Yonex', price: 23500, img: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8889?w=500' },
    { name: 'Wilson Blade 98 v8 16x19', cat: EquipmentCategory.racket, brand: 'Wilson', price: 22999, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500' },
    { name: 'Babolat Pure Aero Rafa Origin', cat: EquipmentCategory.racket, brand: 'Babolat', price: 26999, img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500' },
    { name: 'Head Radical MP 2024', cat: EquipmentCategory.racket, brand: 'Head', price: 20999, img: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8889?w=500' },
    { name: 'Tecnifibre TFight 305 Isoflex', cat: EquipmentCategory.racket, brand: 'Tecnifibre', price: 19999, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500' },

    // Balls
    { name: 'Slazenger Wimbledon Tennis Balls (Can of 4)', cat: EquipmentCategory.ball, brand: 'Slazenger', price: 899, img: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500' },
    { name: 'Wilson US Open Extra Duty (Can of 4)', cat: EquipmentCategory.ball, brand: 'Wilson', price: 950, img: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500' },
    { name: 'Head Tour XT Championship Balls (Can of 3)', cat: EquipmentCategory.ball, brand: 'Head', price: 799, img: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500' },
    { name: 'Kookaburra Turf White Match Cricket Ball', cat: EquipmentCategory.ball, brand: 'Kookaburra', price: 4499, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500' },
    { name: 'SG Club Four-Piece White Cricket Ball', cat: EquipmentCategory.ball, brand: 'SG', price: 750, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500' },
    { name: 'SG Test Red Leather Match Ball', cat: EquipmentCategory.ball, brand: 'SG', price: 1850, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500' },
    { name: 'SS True Test Grade 1 Cricket Ball', cat: EquipmentCategory.ball, brand: 'SS', price: 1450, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500' },

    // Shoes
    { name: 'Asics Gel-Resolution 9 Clay Court Shoes', cat: EquipmentCategory.shoe, brand: 'Asics', price: 13999, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
    { name: 'Nike Court Air Zoom Vapor Pro 2', cat: EquipmentCategory.shoe, brand: 'Nike', price: 11495, img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500' },
    { name: 'Adidas Barricade 13 All-Court', cat: EquipmentCategory.shoe, brand: 'Adidas', price: 12999, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
    { name: 'Asics Speed Menace Cricket Spikes', cat: EquipmentCategory.shoe, brand: 'Asics', price: 9999, img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500' },
    { name: 'Kookaburra Pro Spike Cricket Shoes', cat: EquipmentCategory.shoe, brand: 'Kookaburra', price: 7499, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },

    // Apparel
    { name: 'Nike Court Dri-FIT Club Polo', cat: EquipmentCategory.apparel, brand: 'Nike', price: 3495, img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500' },
    { name: 'Adidas Club Tennis Stretch Shorts', cat: EquipmentCategory.apparel, brand: 'Adidas', price: 2799, img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500' },
    { name: 'Under Armour HeatGear Compression Tee', cat: EquipmentCategory.apparel, brand: 'Under Armour', price: 2499, img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500' },
    { name: 'Castore Championship Track Jacket', cat: EquipmentCategory.apparel, brand: 'Castore', price: 5499, img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500' },
    { name: 'SG Test Whites Match Trousers', cat: EquipmentCategory.apparel, brand: 'SG', price: 1899, img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500' },

    // Accessories & Bats
    { name: 'SS Ton Vintage English Willow Bat', cat: EquipmentCategory.accessory, brand: 'SS', price: 28500, img: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?w=500' },
    { name: 'MRF Genius Grand Edition Cricket Bat', cat: EquipmentCategory.accessory, brand: 'MRF', price: 34999, img: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?w=500' },
    { name: 'Shrey Master Class Air Cricket Helmet', cat: EquipmentCategory.accessory, brand: 'Shrey', price: 7999, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500' },
    { name: 'Tourna Grip Original Overgrip (Pack of 10)', cat: EquipmentCategory.accessory, brand: 'Tourna', price: 1899, img: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=500' },
    { name: 'Luxilon ALU Power 125 Tennis String Reel', cat: EquipmentCategory.accessory, brand: 'Luxilon', price: 19500, img: 'https://images.unsplash.com/photo-1511067007772-9da28925790b?w=500' },
    { name: 'Champions Club Insulated Steel Flask (1000ml)', cat: EquipmentCategory.accessory, brand: 'Champions Club', price: 1499, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500' },
  ];

  const equipmentData: Array<{
    name: string;
    category: EquipmentCategory;
    brand: string;
    description: string;
    price: number;
    stockQty: number;
    lowStockThreshold: number;
    isActive: boolean;
    imageUrl: string;
  }> = [];

  for (let i = 0; i < 330; i++) {
    const tmpl = equipmentTemplates[i % equipmentTemplates.length];
    const cycleNo = Math.floor(i / equipmentTemplates.length) + 1;
    const variantName = cycleNo === 1 ? tmpl.name : `${tmpl.name} (Series ${cycleNo})`;

    equipmentData.push({
      name: variantName,
      category: tmpl.cat,
      brand: tmpl.brand,
      description: `Premium grade athletic sports gear by ${tmpl.brand}. Engineered for professional and club athletes. Batch edition #${cycleNo}.`,
      price: tmpl.price,
      stockQty: 5 + (i * 3) % 45,
      lowStockThreshold: 4 + (i % 6),
      isActive: true,
      imageUrl: tmpl.img,
    });
  }

  await prisma.equipment.createMany({ data: equipmentData });
  const equipmentList = await prisma.equipment.findMany({ select: { id: true, name: true, price: true, category: true } });
  console.log(`✅ Seeded ${equipmentList.length} equipment items`);

  // ==========================================
  // 8. MENU ITEMS (330 rows)
  // ==========================================
  console.log('📌 Seeding 330 cafe and lounge menu items...');
  const menuTemplates = [
    // Beverages
    { name: 'Espresso Double Shot', cat: MenuCategory.beverage, price: 180, desc: 'Rich arabica double pull with smooth golden crema.', img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500' },
    { name: 'Iced Cold Brew Latte', cat: MenuCategory.beverage, price: 240, desc: '18-hour slow steeped cold brew with whole oat milk.', img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500' },
    { name: 'Pro Whey Banana Shake', cat: MenuCategory.beverage, price: 320, desc: '30g whey isolate, ripe bananas, almond butter & chia seeds.', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500' },
    { name: 'Fresh Valencia Orange Juice', cat: MenuCategory.beverage, price: 210, desc: 'Cold pressed 100% natural Valencia oranges without added sugar.', img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500' },
    { name: 'Electrolyte Berry Hydration Drink', cat: MenuCategory.beverage, price: 190, desc: 'Optimal isotonic blend with magnesium, sodium, potassium and berries.', img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500' },
    { name: 'Sparkling Mineral Water (750ml)', cat: MenuCategory.beverage, price: 150, desc: 'Imported crisp carbonated spring water served chilled with lemon wedge.', img: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500' },
    { name: 'Classic Virgin Mojito', cat: MenuCategory.beverage, price: 260, desc: 'Fresh muddled garden mint, zesty lime wedges and club soda.', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500' },
    { name: 'High-Altitude Pour-Over Arabica', cat: MenuCategory.beverage, price: 220, desc: 'Single-origin washed beans with floral citrus notes.', img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500' },
    { name: 'Organic Matcha Green Tea Latte', cat: MenuCategory.beverage, price: 280, desc: 'Ceremonial Uji matcha whisked with warm almond milk.', img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500' },
    { name: 'ABC Vitality Juice (Apple Beet Carrot)', cat: MenuCategory.beverage, price: 230, desc: 'Fresh pressed detox juice packed with nitrates and micronutrients.', img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500' },

    // Food
    { name: 'Champions Club Triple Sandwich', cat: MenuCategory.food, price: 390, desc: 'Grilled smoked chicken, cheddar, organic tomatoes, avocado on sourdough.', img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500' },
    { name: 'Tandoori Paneer Multigrain Wrap', cat: MenuCategory.food, price: 340, desc: 'Marinated cottage cheese, bell peppers, mint yogurt dressing in flax wrap.', img: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500' },
    { name: 'High-Protein Quinoa Chicken Bowl', cat: MenuCategory.food, price: 460, desc: 'Roasted chicken breast, organic quinoa, edamame, lemon vinaigrette.', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' },
    { name: 'Mediterranean Greek Salad', cat: MenuCategory.food, price: 310, desc: 'Crisp cucumbers, kalamata olives, feta cheese cubes, extra virgin olive oil.', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500' },
    { name: 'Grilled Atlantic Salmon with Asparagus', cat: MenuCategory.food, price: 680, desc: 'Pan-seared Norwegian salmon fillet, charred asparagus, lemon caper butter.', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500' },
    { name: 'Whole Wheat Penne Arrabiata', cat: MenuCategory.food, price: 360, desc: 'Al dente durum wheat penne tossed in fiery San Marzano tomato sauce.', img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500' },
    { name: 'Fettuccine Truffle Mushroom Alfredo', cat: MenuCategory.food, price: 420, desc: 'Wild portobello and button mushrooms in rich truffle cream reduction.', img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500' },
    { name: 'Rosemary Grilled Chicken Breast', cat: MenuCategory.food, price: 490, desc: 'Sous-vide chicken breast with garlic mash and steamed garden greens.', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' },

    // Snacks
    { name: 'Crispy Truffle Parmesan Fries', cat: MenuCategory.snack, price: 250, desc: 'Skin-on golden potato fries tossed with white truffle oil and aged parmesan.', img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500' },
    { name: 'Loaded Corn Nachos with Pico & Guac', cat: MenuCategory.snack, price: 280, desc: 'Stone-ground tortilla chips, warm queso, house-made guacamole and salsa.', img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' },
    { name: 'Raw Almonds & Cranberry Trail Pack', cat: MenuCategory.snack, price: 160, desc: 'Roasted almonds, walnuts, pumpkin seeds and dried wild cranberries.', img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500' },
    { name: 'Dark Chocolate Protein Energy Bar', cat: MenuCategory.snack, price: 190, desc: '70% Belgian dark chocolate coated whey crisp bar, 20g protein.', img: 'https://images.unsplash.com/photo-1622484216258-6927d3122c54?w=500' },
    { name: 'Hummus with Warm Zaatar Pita', cat: MenuCategory.snack, price: 290, desc: 'Silky tahini chickpea dip drizzled with olive oil, paprika and warm pita.', img: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=500' },
    { name: 'Salted Edamame Pods with Pink Salt', cat: MenuCategory.snack, price: 220, desc: 'Steamed whole soybean pods sprinkled with crushed Himalayan rock salt.', img: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=500' },
    { name: 'Greek Yogurt Berry Parfait', cat: MenuCategory.snack, price: 240, desc: 'Probiotic Greek yogurt layered with artisanal granola and wild berry compote.', img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500' },
  ];

  const menuData: Array<{
    name: string;
    category: MenuCategory;
    description: string;
    price: number;
    stockQty: number;
    lowStockThreshold: number;
    isAvailable: boolean;
    imageUrl: string;
  }> = [];

  for (let i = 0; i < 330; i++) {
    const tmpl = menuTemplates[i % menuTemplates.length];
    const cycleNo = Math.floor(i / menuTemplates.length) + 1;
    const variantName = cycleNo === 1 ? tmpl.name : `${tmpl.name} (Choice ${cycleNo})`;

    menuData.push({
      name: variantName,
      category: tmpl.cat,
      description: tmpl.desc,
      price: tmpl.price,
      stockQty: 10 + (i * 2) % 60,
      lowStockThreshold: 5 + (i % 8),
      isAvailable: true,
      imageUrl: tmpl.img,
    });
  }

  await prisma.menuItem.createMany({ data: menuData });
  const menuItemList = await prisma.menuItem.findMany({ select: { id: true, name: true, price: true, category: true } });
  console.log(`✅ Seeded ${menuItemList.length} menu items`);

  // ==========================================
  // 9. BOOKINGS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 court and pitch bookings...');
  const bookingsData: Array<{
    courtId: number;
    memberId: number | null;
    guestName: string | null;
    guestPhone: string | null;
    bookingType: BookingType;
    slotStart: Date;
    slotEnd: Date;
    status: BookingStatus;
    amountPaid: number;
    paymentMethod: PaymentMethod | null;
    notes: string;
    createdAt: Date;
  }> = [];

  const paymentMethodsCycle = [PaymentMethod.card, PaymentMethod.upi, PaymentMethod.cash, PaymentMethod.plan];
  const slotHours = [6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20];

  for (let i = 0; i < 350; i++) {
    const court = courtList[i % courtList.length];
    const isGuest = i % 8 === 0;
    const member = isGuest ? null : memberList[i % memberList.length];
    const dayOffset = -45 + Math.floor(i / 6); // past 45 days up to next 15 days
    const slotDate = addDays(today, dayOffset);
    const startHour = slotHours[i % slotHours.length];
    const slotStart = createDateTime(slotDate, startHour, 0);
    const slotEnd = createDateTime(slotDate, startHour + 1, 0);

    const isCancelled = i % 18 === 0;
    const rate = court.sport === SportType.cricket ? 400 : 250;
    const amount = isCancelled ? 0 : rate;
    const method = isCancelled ? null : paymentMethodsCycle[i % paymentMethodsCycle.length];

    bookingsData.push({
      courtId: court.id,
      memberId: member ? member.id : null,
      guestName: isGuest ? `Guest Player ${100 + i}` : null,
      guestPhone: isGuest ? `98${String(70000000 + i).slice(-8)}` : null,
      bookingType: isGuest ? BookingType.walk_in : (i % 5 === 0 ? BookingType.social : BookingType.member),
      slotStart,
      slotEnd,
      status: isCancelled ? BookingStatus.cancelled : BookingStatus.confirmed,
      amountPaid: amount,
      paymentMethod: method,
      notes: isCancelled ? 'Reservation cancelled upon member phone request' : `Court booking for ${court.name} slot session`,
      createdAt: addDays(slotStart, -2),
    });
  }

  await prisma.booking.createMany({ data: bookingsData });
  const bookingList = await prisma.booking.findMany({ select: { id: true, memberId: true, amountPaid: true, paymentMethod: true, slotStart: true, status: true } });
  console.log(`✅ Seeded ${bookingList.length} court bookings`);

  // ==========================================
  // 10. BOOKING PARTICIPANTS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 booking participants...');
  const participantsData: Array<{
    bookingId: number;
    memberId: number | null;
    guestName: string | null;
    createdAt: Date;
  }> = [];

  for (let i = 0; i < 350; i++) {
    const booking = bookingList[i % bookingList.length];
    const isMember = i % 3 !== 0;
    const partMember = isMember ? memberList[(i * 3 + 1) % memberList.length] : null;

    participantsData.push({
      bookingId: booking.id,
      memberId: partMember ? partMember.id : null,
      guestName: partMember ? null : `Guest Partner ${i + 1}`,
      createdAt: booking.slotStart,
    });
  }

  await prisma.bookingParticipant.createMany({ data: participantsData });
  console.log(`✅ Seeded ${participantsData.length} booking participants`);

  // ==========================================
  // 11. ORDERS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 orders across pro-shop, online, and bar...');
  const ordersData: Array<{
    memberId: number | null;
    orderType: OrderType;
    status: OrderStatus;
    paymentMethod: PaymentMethod | null;
    subtotal: number;
    discountAmount: number;
    totalAmount: number;
    deliveryAddress: string | null;
    createdAt: Date;
  }> = [];

  const orderTypes = [OrderType.in_store, OrderType.online, OrderType.bar];
  const orderStatuses = [OrderStatus.fulfilled, OrderStatus.fulfilled, OrderStatus.confirmed, OrderStatus.pending, OrderStatus.cancelled];

  for (let i = 0; i < 350; i++) {
    const member = memberList[i % memberList.length];
    const orderType = orderTypes[i % orderTypes.length];
    const status = orderStatuses[i % orderStatuses.length];
    const dayOffset = -40 + Math.floor(i / 7);
    const createdAt = createDateTime(addDays(today, dayOffset), 10 + (i % 10), (i * 7) % 60);

    const subtotal = 1200 + (i * 137) % 18000;
    const discountPct = member.tier === MembershipTier.Gold ? 0.15 : (member.tier === MembershipTier.Silver ? 0.10 : 0.05);
    const discount = Math.round(subtotal * discountPct);
    const total = subtotal - discount;

    ordersData.push({
      memberId: member.id,
      orderType,
      status,
      paymentMethod: status === OrderStatus.cancelled ? null : paymentMethodsCycle[i % paymentMethodsCycle.length],
      subtotal,
      discountAmount: discount,
      totalAmount: total,
      deliveryAddress: orderType === OrderType.online ? `Club Member Residence Delivery, Building ${10 + (i % 50)}, Mumbai` : null,
      createdAt,
    });
  }

  await prisma.order.createMany({ data: ordersData });
  const orderList = await prisma.order.findMany({ select: { id: true, memberId: true, totalAmount: true, paymentMethod: true, createdAt: true, status: true } });
  console.log(`✅ Seeded ${orderList.length} orders`);

  // ==========================================
  // 12. ORDER ITEMS - EQUIPMENT (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 order equipment lines...');
  const orderEquipData: Array<{
    orderId: number;
    equipmentId: number;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }> = [];

  for (let i = 0; i < 350; i++) {
    const order = orderList[i % orderList.length];
    const equip = equipmentList[i % equipmentList.length];
    const qty = 1 + (i % 3);
    const unitPrice = Number(equip.price);
    const subtotal = unitPrice * qty;

    orderEquipData.push({
      orderId: order.id,
      equipmentId: equip.id,
      qty,
      unitPrice,
      subtotal,
    });
  }

  await prisma.orderItemEquipment.createMany({ data: orderEquipData });
  console.log(`✅ Seeded ${orderEquipData.length} order equipment items`);

  // ==========================================
  // 13. ORDER ITEMS - MENU (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 order menu lines...');
  const orderMenuData: Array<{
    orderId: number;
    menuItemId: number;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }> = [];

  for (let i = 0; i < 350; i++) {
    const order = orderList[(i + 175) % orderList.length];
    const menuItem = menuItemList[i % menuItemList.length];
    const qty = 1 + (i % 4);
    const unitPrice = Number(menuItem.price);
    const subtotal = unitPrice * qty;

    orderMenuData.push({
      orderId: order.id,
      menuItemId: menuItem.id,
      qty,
      unitPrice,
      subtotal,
    });
  }

  await prisma.orderItemMenu.createMany({ data: orderMenuData });
  console.log(`✅ Seeded ${orderMenuData.length} order menu items`);

  // ==========================================
  // 14. BAR TABS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 bar and terrace tabs...');
  const barTabsData: Array<{
    barTableId: number;
    memberId: number | null;
    openedBy: number;
    status: TabStatus;
    openedAt: Date;
    settledAt: Date | null;
    notes: string;
  }> = [];

  const barStaffList = staffList.filter((s) => s.role === StaffRole.bar || s.role === StaffRole.front_desk || s.role === StaffRole.admin);

  for (let i = 0; i < 350; i++) {
    const table = tableList[i % tableList.length];
    const member = i % 7 === 0 ? null : memberList[i % memberList.length];
    const staff = barStaffList[i % barStaffList.length];
    const dayOffset = -30 + Math.floor(i / 10);
    const openedAt = createDateTime(addDays(today, dayOffset), 12 + (i % 10), (i * 11) % 60);

    const isSettled = dayOffset < 0 || i % 4 !== 0;
    const settledAt = isSettled ? new Date(openedAt.getTime() + (45 + (i % 75)) * 60 * 1000) : null;

    barTabsData.push({
      barTableId: table.id,
      memberId: member ? member.id : null,
      openedBy: staff.id,
      status: isSettled ? TabStatus.settled : TabStatus.open,
      openedAt,
      settledAt,
      notes: member ? `Tab opened for member ${member.firstName} at table ${table.tableNo}` : `Walk-in customer tab at table ${table.tableNo}`,
    });
  }

  await prisma.barTab.createMany({ data: barTabsData });
  const barTabList = await prisma.barTab.findMany({ select: { id: true, memberId: true, status: true, openedAt: true, settledAt: true } });
  console.log(`✅ Seeded ${barTabList.length} bar tabs`);

  // ==========================================
  // 15. BAR TAB ITEMS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 bar tab food & drink items...');
  const barTabItemsData: Array<{
    tabId: number;
    menuItemId: number;
    qty: number;
    unitPrice: number;
    subtotal: number;
    createdAt: Date;
  }> = [];

  for (let i = 0; i < 350; i++) {
    const tab = barTabList[i % barTabList.length];
    const menu = menuItemList[(i * 3) % menuItemList.length];
    const qty = 1 + (i % 3);
    const unitPrice = Number(menu.price);
    const subtotal = unitPrice * qty;

    barTabItemsData.push({
      tabId: tab.id,
      menuItemId: menu.id,
      qty,
      unitPrice,
      subtotal,
      createdAt: tab.openedAt,
    });
  }

  await prisma.barTabItem.createMany({ data: barTabItemsData });
  console.log(`✅ Seeded ${barTabItemsData.length} bar tab items`);

  // ==========================================
  // 16. CRM LEADS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 CRM prospective leads...');
  const leadStatuses = [LeadStatus.new, LeadStatus.contacted, LeadStatus.converted, LeadStatus.lost];
  const leadInquiries = [
    'Inquiring about Gold annual family membership covering 2 adults and 2 children for weekend tennis.',
    'Corporate sports day package inquiry for 75 employees including floodlit cricket tournament and terrace buffet.',
    'Junior cricket academy inquiry for 14-year-old aspirant targeting district team selection.',
    'Tennis clay court hourly package booking inquiry for weekly weekend doubles fixture.',
    'Inquiry about racket stringing service and pro-shop custom weights.',
    'Summer holiday intensive tennis and cricket camp inquiry with certified coaching staff.',
    'Private coach personal training inquiry for fast-bowling biomechanics video analysis.',
    'Lounge and terrace banquet private booking inquiry for sports club celebration dinner.',
  ];

  const leadsData: Array<{
    name: string;
    email: string;
    phone: string;
    message: string;
    status: LeadStatus;
    assignedTo: number | null;
    createdAt: Date;
  }> = [];

  const frontDeskStaff = staffList.filter((s) => s.role === StaffRole.front_desk || s.role === StaffRole.admin);

  for (let i = 0; i < 350; i++) {
    const fn = firstNamesPool[i % firstNamesPool.length];
    const ln = lastNamesPool[(i * 5 + 3) % lastNamesPool.length];
    const assigned = frontDeskStaff[i % frontDeskStaff.length];
    const dayOffset = -40 + Math.floor(i / 8);
    const createdAt = createDateTime(addDays(today, dayOffset), 9 + (i % 9), (i * 13) % 60);

    leadsData.push({
      name: `${fn} ${ln}`,
      email: `lead.${fn.toLowerCase()}.${ln.toLowerCase()}.${i + 1}@example.com`,
      phone: `98${String(40000000 + i).slice(-8)}`,
      message: leadInquiries[i % leadInquiries.length],
      status: leadStatuses[i % leadStatuses.length],
      assignedTo: assigned.id,
      createdAt,
    });
  }

  await prisma.lead.createMany({ data: leadsData });
  console.log(`✅ Seeded ${leadsData.length} CRM prospective leads`);

  // ==========================================
  // 17. SHIFTS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 staff shifts...');
  const shiftsData: Array<{
    staffId: number;
    shiftDate: Date;
    shiftStart: Date;
    shiftEnd: Date;
    notes: string;
    createdAt: Date;
  }> = [];

  const shiftSchedules = [
    { startH: 6, startM: 0, endH: 14, endM: 30, desc: 'Morning reception & court opening shift' },
    { startH: 9, startM: 0, endH: 17, endM: 30, desc: 'General management & inventory duty' },
    { startH: 14, startM: 0, endH: 22, endM: 30, desc: 'Evening peak court reservation shift' },
    { startH: 15, startM: 30, endH: 23, endM: 30, desc: 'Terrace lounge & bar closing shift' },
  ];

  for (let i = 0; i < 350; i++) {
    const staff = staffList[i % staffList.length];
    const dayOffset = -25 + Math.floor(i / 10);
    const shiftDate = addDays(today, dayOffset);
    const sched = shiftSchedules[i % shiftSchedules.length];
    const shiftStart = createDateTime(shiftDate, sched.startH, sched.startM);
    const shiftEnd = createDateTime(shiftDate, sched.endH, sched.endM);

    shiftsData.push({
      staffId: staff.id,
      shiftDate,
      shiftStart,
      shiftEnd,
      notes: `${sched.desc} - Staff ID ${staff.id}`,
      createdAt: addDays(shiftDate, -3),
    });
  }

  await prisma.shift.createMany({ data: shiftsData });
  console.log(`✅ Seeded ${shiftsData.length} staff duty shifts`);

  // ==========================================
  // 18. LEAVE REQUESTS (330 rows)
  // ==========================================
  console.log('📌 Seeding 330 staff leave requests...');
  const leaveStatuses = [LeaveStatus.approved, LeaveStatus.approved, LeaveStatus.pending, LeaveStatus.rejected];
  const leaveReasons = [
    'Annual family holiday trip; shift coverage coordinated with team members.',
    'Scheduled routine dental and medical checkup procedure.',
    'Attending university semester examinations and study leave.',
    'Participating in State Tennis Championship tournament fixture.',
    'Attending cousin wedding celebrations out of town.',
    'Personal domestic emergency requiring short leave of absence.',
    'Recovering from minor seasonal viral fever as recommended by physician.',
  ];

  const adminStaff = staffList.filter((s) => s.role === StaffRole.admin);
  const leaveRequestsData: Array<{
    staffId: number;
    fromDate: Date;
    toDate: Date;
    reason: string;
    status: LeaveStatus;
    reviewedBy: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
  }> = [];

  for (let i = 0; i < 330; i++) {
    const staff = staffList[i % staffList.length];
    const admin = adminStaff[i % adminStaff.length];
    const dayOffset = -20 + Math.floor(i / 8);
    const fromDate = addDays(today, dayOffset);
    const toDate = addDays(fromDate, 1 + (i % 4));
    const status = leaveStatuses[i % leaveStatuses.length];
    const reviewed = status !== LeaveStatus.pending;

    leaveRequestsData.push({
      staffId: staff.id,
      fromDate,
      toDate,
      reason: leaveReasons[i % leaveReasons.length],
      status,
      reviewedBy: reviewed ? admin.id : null,
      reviewedAt: reviewed ? createDateTime(addDays(fromDate, -2), 11, 0) : null,
      createdAt: addDays(fromDate, -3),
    });
  }

  await prisma.leaveRequest.createMany({ data: leaveRequestsData });
  console.log(`✅ Seeded ${leaveRequestsData.length} staff leave requests`);

  // ==========================================
  // 19. PAYMENTS (350 rows)
  // ==========================================
  console.log('📌 Seeding 350 payment transactions...');
  const paymentsData: Array<{
    memberId: number | null;
    bookingId: number | null;
    orderId: number | null;
    barTabId: number | null;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNo: string;
    notes: string;
    paidAt: Date;
  }> = [];

  for (let i = 0; i < 350; i++) {
    const categoryMod = i % 4;
    const member = memberList[i % memberList.length];
    const method = paymentMethodsCycle[i % paymentMethodsCycle.length];

    if (categoryMod === 0) {
      // Booking Payment
      const booking = bookingList[i % bookingList.length];
      const amount = Number(booking.amountPaid) || 250;
      paymentsData.push({
        memberId: booking.memberId,
        bookingId: booking.id,
        orderId: null,
        barTabId: null,
        amount,
        paymentMethod: booking.paymentMethod || method,
        referenceNo: `TXN-BK-${20260000 + i}`,
        notes: `Court reservation payment for booking #${booking.id}`,
        paidAt: booking.slotStart,
      });
    } else if (categoryMod === 1) {
      // Order Payment
      const order = orderList[i % orderList.length];
      const amount = Number(order.totalAmount) || 1500;
      paymentsData.push({
        memberId: order.memberId,
        bookingId: null,
        orderId: order.id,
        barTabId: null,
        amount,
        paymentMethod: order.paymentMethod || method,
        referenceNo: `TXN-ORD-${20260000 + i}`,
        notes: `Pro-shop & club store order payment #${order.id}`,
        paidAt: order.createdAt,
      });
    } else if (categoryMod === 2) {
      // Bar Tab Payment
      const tab = barTabList[i % barTabList.length];
      const amount = 350 + (i * 67) % 2500;
      paymentsData.push({
        memberId: tab.memberId,
        bookingId: null,
        orderId: null,
        barTabId: tab.id,
        amount,
        paymentMethod: method,
        referenceNo: `TXN-BAR-${20260000 + i}`,
        notes: `Settled bar & terrace lounge tab #${tab.id}`,
        paidAt: tab.settledAt || tab.openedAt,
      });
    } else {
      // Membership Subscription Renewal Payment
      const planPrices = [20000, 30000, 50000];
      const amount = planPrices[i % planPrices.length];
      const paidDate = addDays(today, -(10 + (i % 120)));
      paymentsData.push({
        memberId: member.id,
        bookingId: null,
        orderId: null,
        barTabId: null,
        amount,
        paymentMethod: method,
        referenceNo: `MEM-SUB-${member.tier.toUpperCase()}-${20260000 + i}`,
        notes: `Annual membership subscription fee for ${member.firstName} ${member.lastName} (${member.tier} tier)`,
        paidAt: paidDate,
      });
    }
  }

  await prisma.payment.createMany({ data: paymentsData });
  console.log(`✅ Seeded ${paymentsData.length} payment transactions`);

  // ==========================================
  // FINAL SEED SUMMARY TABLE
  // ==========================================
  console.log('\n=========================================');
  console.log('✨ CHAMPIONS SPORTS CLUB SEED COMPLETED!');
  console.log('=========================================');
  console.log('All tables successfully populated with 300-400 relevant rows:');
  console.log(`1.  Membership Plans:        ${plansData.length} rows`);
  console.log(`2.  Staff Members:           ${staffList.length} rows`);
  console.log(`3.  Club Members:            ${memberList.length} rows`);
  console.log(`4.  Member Addresses:        ${addressesData.length} rows`);
  console.log(`5.  Courts & Pitches:        ${courtList.length} rows`);
  console.log(`6.  Bar & Lounge Tables:     ${tableList.length} rows`);
  console.log(`7.  Equipment Products:      ${equipmentList.length} rows`);
  console.log(`8.  Menu Items:              ${menuItemList.length} rows`);
  console.log(`9.  Court Bookings:          ${bookingList.length} rows`);
  console.log(`10. Booking Participants:    ${participantsData.length} rows`);
  console.log(`11. Orders:                  ${orderList.length} rows`);
  console.log(`12. Order Equipment Lines:   ${orderEquipData.length} rows`);
  console.log(`13. Order Menu Lines:        ${orderMenuData.length} rows`);
  console.log(`14. Bar Tabs:                ${barTabList.length} rows`);
  console.log(`15. Bar Tab Items:           ${barTabItemsData.length} rows`);
  console.log(`16. CRM Prospective Leads:   ${leadsData.length} rows`);
  console.log(`17. Staff Shifts:            ${shiftsData.length} rows`);
  console.log(`18. Staff Leave Requests:    ${leaveRequestsData.length} rows`);
  console.log(`19. Payment Transactions:    ${paymentsData.length} rows`);
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
