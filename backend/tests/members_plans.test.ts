import { isUnder18, addMonths, formatDateOnly } from '../src/modules/members/members.service';
import { formatPlan } from '../src/modules/plans/plans.service';
import {
  createMemberSchema,
  updateMemberSchema,
  renewMemberSchema,
  listMembersQuerySchema,
} from '../src/modules/members/members.validator';
import {
  createPlanSchema,
  updatePlanSchema,
} from '../src/modules/plans/plans.validator';
import { addressBodySchema } from '../src/modules/members/address.validator';
import { Prisma, MembershipTier } from '@prisma/client';

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
  console.log('🧪 RUNNING MEMBERS & PLANS UNIT & VALIDATION TESTS');
  console.log('==================================================\n');

  // --- 1. JUNIOR AGE VERIFICATION ---
  console.log('📌 Test Suite 1: Junior Age Rule (isUnder18)');
  const today = new Date();
  const seventeenYearsAgo = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
  const nineteenYearsAgo = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate());

  assert(isUnder18(seventeenYearsAgo) === true, '17-year-old is recognized as under 18');
  assert(isUnder18(nineteenYearsAgo) === false, '19-year-old is recognized as NOT under 18');

  // --- 2. DATE CALCULATIONS ---
  console.log('\n📌 Test Suite 2: Date Calculations (addMonths, formatDateOnly)');
  const baseDate = new Date('2026-01-15T00:00:00Z');
  const plus12Months = addMonths(baseDate, 12);
  assert(plus12Months.getMonth() === baseDate.getMonth(), 'addMonths correctly increments 12 months');
  assert(formatDateOnly(baseDate) === '2026-01-15', 'formatDateOnly produces YYYY-MM-DD');

  // --- 3. CURRENCY TRANSFORMATION (formatPlan) ---
  console.log('\n📌 Test Suite 3: Currency Transformation (formatPlan: Decimal -> Paise)');
  const mockPlan = {
    id: 1,
    tier: MembershipTier.Gold,
    durationMonths: 12,
    price: new Prisma.Decimal('50000.00'), // ₹50,000 in DB
    courtRate: new Prisma.Decimal('150.00'), // ₹150 in DB
    shopDiscountPct: 20,
    barDiscountPct: 20,
    isActive: true,
  };
  const formatted = formatPlan(mockPlan as any);
  assert(formatted.pricePaise === 5000000, '₹50,000 correctly maps to 5,000,000 paise');
  assert(formatted.courtRatePaise === 15000, '₹150 court rate correctly maps to 15,000 paise');

  // --- 4. ZOD VALIDATION: CREATE PLAN ---
  console.log('\n📌 Test Suite 4: Plan Validation (MP-02)');
  const validPlan = createPlanSchema.safeParse({
    tier: 'Gold',
    durationMonths: 6,
    pricePaise: 2700000,
    courtRatePaise: 18000,
    shopDiscountPct: 15,
    barDiscountPct: 15,
  });
  assert(validPlan.success === true, 'Valid plan creation payload passes Zod schema');

  const invalidPlan = createPlanSchema.safeParse({
    tier: 'Platinum', // Invalid tier
    durationMonths: 4, // Invalid duration
    pricePaise: -100, // Negative money
    courtRatePaise: 0,
    shopDiscountPct: 120, // > 100%
    barDiscountPct: 0,
  });
  assert(invalidPlan.success === false, 'Invalid plan creation payload is rejected by Zod');

  // --- 5. ZOD VALIDATION: UPDATE PLAN IMMUTABILITY ---
  console.log('\n📌 Test Suite 5: Plan Immutability (MP-03)');
  const mutableUpdate = updatePlanSchema.safeParse({
    pricePaise: 2800000,
    isActive: false,
  });
  assert(mutableUpdate.success === true, 'Price and isActive update allowed');

  const immutableUpdate = updatePlanSchema.safeParse({
    tier: 'Silver', // Attempt to mutate tier
  });
  assert(immutableUpdate.success === false, 'Attempt to mutate tier is rejected by Zod');

  // --- 6. ZOD VALIDATION: MEMBER ADDRESS (MA-02) ---
  console.log('\n📌 Test Suite 6: Member Address Validation (MA-02)');
  const validAddress = addressBodySchema.safeParse({
    addrLine1: '123 Main Street',
    addrLine2: 'Suite 400',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  });
  assert(validAddress.success === true, 'Valid 6-digit pincode address passes');

  const invalidAddress = addressBodySchema.safeParse({
    addrLine1: '',
    pincode: '40001', // 5 digits
  });
  assert(invalidAddress.success === false, '5-digit pincode is rejected');

  // --- 7. ZOD VALIDATION: MEMBER REGISTRATION (ME-02) ---
  console.log('\n📌 Test Suite 7: Member Registration Validation (ME-02)');
  const validMember = createMemberSchema.safeParse({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'Password@123',
    tier: 'Gold',
    planId: 1,
  });
  assert(validMember.success === true, 'Valid member registration passes');

  const shortPassword = createMemberSchema.safeParse({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'short', // < 8 chars
    tier: 'Gold',
    planId: 1,
  });
  assert(shortPassword.success === false, 'Password < 8 chars is rejected');

  // --- 8. ZOD VALIDATION: MEMBER UPDATE IMMUTABILITY (ME-04) ---
  console.log('\n📌 Test Suite 8: Member Self-Edit & Immutability (ME-04)');
  const immutableMemberUpdate = updateMemberSchema.safeParse({
    membershipEnd: '2028-01-01', // Attempt to mutate membershipEnd
  });
  assert(immutableMemberUpdate.success === false, 'Attempt to mutate membershipEnd directly is rejected');

  // --- 9. RENEWAL VALIDATION (ME-05) ---
  console.log('\n📌 Test Suite 9: Member Renewal Validation (ME-05)');
  const validRenewal = renewMemberSchema.safeParse({
    durationMonths: 12,
    paymentMethod: 'card',
    amountPaise: 5000000,
    referenceNo: 'TXN_98765',
  });
  assert(validRenewal.success === true, 'Valid renewal payload passes');

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
