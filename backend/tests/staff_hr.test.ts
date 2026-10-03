import { formatStaff, formatShift, formatLeave } from '../src/modules/staff/staff.service';
import {
  createStaffSchema,
  updateStaffSchema,
  listStaffQuerySchema,
  startShiftSchema,
  endShiftSchema,
  createLeaveSchema,
  reviewLeaveSchema,
} from '../src/modules/staff/staff.validator';
import { Prisma, StaffRole, LeaveStatus } from '@prisma/client';

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
  console.log('🧪 RUNNING STAFF & HR UNIT & VALIDATION TESTS');
  console.log('==================================================\n');

  // --- 1. STAFF FORMATTING & SENSITIVE DATA ENCAPSULATION ---
  console.log('📌 Test Suite 1: Sensitive Data Masking & Salary (formatStaff)');
  const mockStaff = {
    id: 1,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@championsclub.com',
    passwordHash: '$2a$12$eImiTXuWVxfM379Y4FAR6e9G.abcdef123456',
    role: StaffRole.bar,
    phone: '+919876543210',
    salary: new Prisma.Decimal('35000.00'), // ₹35,000 in DB
    isActive: true,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
  };

  const adminView = formatStaff(mockStaff as any, true);
  const selfView = formatStaff(mockStaff as any, false);

  assert((adminView as any).passwordHash === undefined, 'passwordHash is stripped from admin view');
  assert((selfView as any).passwordHash === undefined, 'passwordHash is stripped from self/public view');
  assert(adminView.salaryPaise === 3500000, 'Admin view includes salaryPaise (₹35,000 -> 3,500,000 paise)');
  assert(selfView.salaryPaise === undefined, 'Non-admin view hides salaryPaise');

  // --- 2. CREATE STAFF VALIDATION (ST-02) ---
  console.log('\n📌 Test Suite 2: Create Staff Validation (ST-02)');
  const validStaff = createStaffSchema.safeParse({
    firstName: 'Bob',
    lastName: 'Manager',
    email: 'bob@championsclub.com',
    password: 'securePassword123',
    role: 'front_desk',
    phone: '+919988776655',
    salary: 4000000, // 40,000 INR in paise
  });
  assert(validStaff.success === true, 'Valid staff creation payload passes');

  const shortPassword = createStaffSchema.safeParse({
    firstName: 'Bob',
    lastName: 'Manager',
    email: 'bob@championsclub.com',
    password: 'short',
    role: 'front_desk',
  });
  assert(shortPassword.success === false, 'Password < 8 characters is rejected');

  const invalidRole = createStaffSchema.safeParse({
    firstName: 'Bob',
    lastName: 'Manager',
    email: 'bob@championsclub.com',
    password: 'securePassword123',
    role: 'super_admin_invalid',
  });
  assert(invalidRole.success === false, 'Invalid staff role is rejected');

  const negativeSalary = createStaffSchema.safeParse({
    firstName: 'Bob',
    lastName: 'Manager',
    email: 'bob@championsclub.com',
    password: 'securePassword123',
    role: 'bar',
    salary: -500,
  });
  assert(negativeSalary.success === false, 'Negative salary is rejected');

  // --- 3. UPDATE STAFF VALIDATION (ST-04) ---
  console.log('\n📌 Test Suite 3: Update Staff Validation (ST-04)');
  const emptyUpdate = updateStaffSchema.safeParse({});
  assert(emptyUpdate.success === false, 'Empty update payload is rejected');

  const validPartialUpdate = updateStaffSchema.safeParse({
    role: 'admin',
    salary: 6000000,
  });
  assert(validPartialUpdate.success === true, 'Valid partial staff update passes');

  // --- 4. SHIFTS VALIDATION & FORMATTING (SH-01, SH-02) ---
  console.log('\n📌 Test Suite 4: Shifts Clock-in/out (SH-01, SH-02)');
  const mockShift = {
    id: 10,
    staffId: 1,
    shiftDate: new Date('2026-10-03T00:00:00Z'),
    shiftStart: new Date('2026-10-03T08:00:00Z'),
    shiftEnd: null,
    notes: 'Morning shift opening',
    createdAt: new Date('2026-10-03T08:00:00Z'),
  };
  const formattedShift = formatShift(mockShift as any);
  assert(formattedShift.shiftDate === '2026-10-03', 'shiftDate correctly formatted as YYYY-MM-DD');
  assert(formattedShift.shiftEnd === null, 'Active shift preserves shiftEnd = null');

  const validStartShift = startShiftSchema.safeParse({ notes: 'Opening counter' });
  assert(validStartShift.success === true, 'Valid start shift payload passes');

  const longNotes = startShiftSchema.safeParse({ notes: 'a'.repeat(501) });
  assert(longNotes.success === false, 'Shift notes > 500 characters rejected');

  // --- 5. LEAVE REQUEST VALIDATION & LIFECYCLE (LV-01, LV-03) ---
  console.log('\n📌 Test Suite 5: Leave Requests (LV-01, LV-03)');
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const validLeave = createLeaveSchema.safeParse({
    fromDate: todayStr,
    toDate: tomorrowStr,
    reason: 'Family event',
  });
  assert(validLeave.success === true, 'Valid leave request for today/tomorrow passes');

  const pastDateLeave = createLeaveSchema.safeParse({
    fromDate: '2020-01-01',
    toDate: '2020-01-05',
    reason: 'Past holiday',
  });
  assert(pastDateLeave.success === false, 'Leave request with past fromDate is rejected');

  const invertedDates = createLeaveSchema.safeParse({
    fromDate: tomorrowStr,
    toDate: todayStr,
    reason: 'Inverted dates',
  });
  assert(invertedDates.success === false, 'toDate < fromDate is rejected');

  const validApprove = reviewLeaveSchema.safeParse({ status: 'approved' });
  const validReject = reviewLeaveSchema.safeParse({ status: 'rejected' });
  const invalidStatus = reviewLeaveSchema.safeParse({ status: 'pending' });

  assert(validApprove.success === true, "Review status 'approved' passes");
  assert(validReject.success === true, "Review status 'rejected' passes");
  assert(invalidStatus.success === false, "Review status 'pending' is rejected");

  console.log('\n==================================================');
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
