import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../../app';
import { prisma } from '../../../config/prisma';
import { generateAccessToken } from '../../../utils/token';

const app = createApp();

const adminToken = generateAccessToken({
  sub: 1,
  email: 'admin@champions.club',
  role: 'admin',
});

const frontDeskToken = generateAccessToken({
  sub: 2,
  email: 'frontdesk@champions.club',
  role: 'front_desk',
});

const memberToken = generateAccessToken({
  sub: 42,
  email: 'john@champions.club',
  role: 'member',
  tier: 'Gold',
});

describe('Public Portal & Leads Module (Contracts PU-01 to PU-07 & LD-01 to LD-03)', () => {
  // ==========================================
  // PU-01 · GET /api/v1/public/plans
  // ==========================================
  describe('PU-01 · GET /api/v1/public/plans', () => {
    it('should return 200 with membership plans grouped by tier without authentication', async () => {
      const origFindMany = prisma.membershipPlan.findMany;
      (prisma.membershipPlan as any).findMany = async () => [
        {
          id: 1,
          tier: 'Gold',
          durationMonths: 1,
          price: 5000,
          courtRate: 0,
          shopDiscountPct: 15,
          barDiscountPct: 15,
          isActive: true,
        },
        {
          id: 2,
          tier: 'Silver',
          durationMonths: 6,
          price: 15000,
          courtRate: 200,
          shopDiscountPct: 10,
          barDiscountPct: 10,
          isActive: true,
        },
      ];

      try {
        const res = await request(app).get('/api/v1/public/plans');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
        assert.strictEqual(res.body.data.length, 2);
        assert.strictEqual(res.body.data[0].tier, 'Gold');
        assert.strictEqual(res.body.data[0].plans[0].pricePaise, 500000);
      } finally {
        (prisma.membershipPlan as any).findMany = origFindMany;
      }
    });
  });

  // ==========================================
  // PU-02 · GET /api/v1/public/courts
  // ==========================================
  describe('PU-02 · GET /api/v1/public/courts', () => {
    it('should return 200 with list of active courts without authentication', async () => {
      const origFindMany = prisma.court.findMany;
      (prisma.court as any).findMany = async () => [
        {
          id: 1,
          name: 'Centre Court',
          sport: 'tennis',
          openTime: '06:00',
          closeTime: '22:00',
        },
      ];

      try {
        const res = await request(app).get('/api/v1/public/courts');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.length, 1);
        assert.strictEqual(res.body.data[0].name, 'Centre Court');
      } finally {
        (prisma.court as any).findMany = origFindMany;
      }
    });
  });

  // ==========================================
  // PU-03 · GET /api/v1/public/equipment
  // ==========================================
  describe('PU-03 · GET /api/v1/public/equipment', () => {
    it('should return 200 with public equipment catalogue, hiding stock details', async () => {
      const origFindMany = prisma.equipment.findMany;
      (prisma.equipment as any).findMany = async () => [
        {
          id: 1,
          name: 'Pro Racket V3',
          category: 'racket',
          brand: 'Wilson',
          description: 'High performance racket',
          price: 12500,
          imageUrl: 'https://example.com/racket.jpg',
        },
      ];

      try {
        const res = await request(app).get('/api/v1/public/equipment');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.length, 1);
        assert.strictEqual(res.body.data[0].pricePaise, 1250000);
        assert.strictEqual(res.body.data[0].stockQty, undefined);
      } finally {
        (prisma.equipment as any).findMany = origFindMany;
      }
    });
  });

  // ==========================================
  // PU-04 · GET /api/v1/public/slots
  // ==========================================
  describe('PU-04 · GET /api/v1/public/slots', () => {
    it('should return 200 with court availability slots without authentication', async () => {
      const origCourtFindMany = prisma.court.findMany;
      const origBookingFindMany = prisma.booking.findMany;

      (prisma.court as any).findMany = async () => [
        {
          id: 1,
          name: 'Court 1',
          sport: 'tennis',
          openTime: '06:00',
          closeTime: '08:00',
          isActive: true,
        },
      ];
      (prisma.booking as any).findMany = async () => [];

      try {
        const res = await request(app).get('/api/v1/public/slots?date=2026-10-05');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.length, 1);
        assert.ok(res.body.data[0].slots.length > 0);
      } finally {
        (prisma.court as any).findMany = origCourtFindMany;
        (prisma.booking as any).findMany = origBookingFindMany;
      }
    });
  });

  // ==========================================
  // PU-05 · POST /api/v1/public/leads
  // ==========================================
  describe('PU-05 · POST /api/v1/public/leads', () => {
    it('should reject with 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/public/leads')
        .send({ email: 'test@example.com' });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should reject with 400 when both email and phone are missing', async () => {
      const res = await request(app)
        .post('/api/v1/public/leads')
        .send({ name: 'John Doe', message: 'Hello' });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should succeed with 201 on valid inquiry', async () => {
      const origCreate = prisma.lead.create;
      (prisma.lead as any).create = async ({ data }: any) => ({
        id: 15,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        const res = await request(app)
          .post('/api/v1/public/leads')
          .send({
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            message: 'Interested in club trial',
          });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.id, 15);
        assert.ok(res.body.data.message);
      } finally {
        (prisma.lead as any).create = origCreate;
      }
    });
  });

  // ==========================================
  // PU-06 · POST /api/v1/public/trial
  // ==========================================
  describe('PU-06 · POST /api/v1/public/trial', () => {
    it('should succeed with 201 and book trial session when court is available', async () => {
      const origCourtFindMany = prisma.court.findMany;
      const origBookingFindFirst = prisma.booking.findFirst;
      const origTransaction = prisma.$transaction;

      (prisma.court as any).findMany = async () => [
        {
          id: 1,
          name: 'Court A',
          sport: 'tennis',
          openTime: '06:00',
          closeTime: '22:00',
          isActive: true,
        },
      ];
      (prisma.booking as any).findFirst = async () => null;

      (prisma as any).$transaction = async (cb: any) => {
        const mockTx = {
          lead: {
            create: async ({ data }: any) => ({ id: 16, ...data, createdAt: new Date() }),
          },
          booking: {
            create: async ({ data }: any) => ({ id: 102, ...data, createdAt: new Date() }),
          },
          payment: {
            create: async () => ({ id: 1 }),
          },
        };
        return cb(mockTx);
      };

      try {
        const res = await request(app)
          .post('/api/v1/public/trial')
          .send({
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            phone: '+919876543210',
            sport: 'tennis',
            preferredDate: '2026-10-10',
            preferredTime: '10:00',
          });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.leadId, 16);
        assert.strictEqual(res.body.data.bookingId, 102);
        assert.strictEqual(res.body.data.courtName, 'Court A');
      } finally {
        (prisma.court as any).findMany = origCourtFindMany;
        (prisma.booking as any).findFirst = origBookingFindFirst;
        (prisma as any).$transaction = origTransaction;
      }
    });

    it('should succeed with 201 and return bookingId: null when all courts are fully booked', async () => {
      const origCourtFindMany = prisma.court.findMany;
      const origBookingFindFirst = prisma.booking.findFirst;
      const origLeadCreate = prisma.lead.create;

      (prisma.court as any).findMany = async () => [
        {
          id: 1,
          name: 'Court A',
          sport: 'tennis',
          openTime: '06:00',
          closeTime: '22:00',
          isActive: true,
        },
      ];
      (prisma.booking as any).findFirst = async () => ({ id: 99 }); // Conflicting booking exists
      (prisma.lead as any).create = async ({ data }: any) => ({
        id: 17,
        ...data,
        createdAt: new Date(),
      });

      try {
        const res = await request(app)
          .post('/api/v1/public/trial')
          .send({
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            phone: '+919876543210',
            sport: 'tennis',
            preferredDate: '2026-10-10',
            preferredTime: '10:00',
          });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.leadId, 17);
        assert.strictEqual(res.body.data.bookingId, null);
      } finally {
        (prisma.court as any).findMany = origCourtFindMany;
        (prisma.booking as any).findFirst = origBookingFindFirst;
        (prisma.lead as any).create = origLeadCreate;
      }
    });
  });

  // ==========================================
  // PU-07 · POST /api/v1/public/register
  // ==========================================
  describe('PU-07 · POST /api/v1/public/register', () => {
    it('should reject with 409 when email already exists', async () => {
      const origMemberFind = prisma.member.findUnique;
      (prisma.member as any).findUnique = async () => ({ id: 1, email: 'exists@example.com' });

      try {
        const res = await request(app)
          .post('/api/v1/public/register')
          .send({
            firstName: 'Sarah',
            lastName: 'Connor',
            email: 'exists@example.com',
            password: 'securePassword123',
            tier: 'Silver',
            planId: 1,
            paymentMethod: 'upi',
          });

        assert.strictEqual(res.status, 409);
        assert.strictEqual(res.body.code, 'DUPLICATE_EMAIL');
      } finally {
        (prisma.member as any).findUnique = origMemberFind;
      }
    });

    it('should reject with 422 when Junior tier applicant is 18+', async () => {
      const origMemberFind = prisma.member.findUnique;
      const origStaffFind = prisma.staff.findUnique;
      const origPlanFind = prisma.membershipPlan.findUnique;

      (prisma.member as any).findUnique = async () => null;
      (prisma.staff as any).findUnique = async () => null;
      (prisma.membershipPlan as any).findUnique = async () => ({
        id: 7,
        tier: 'Junior',
        durationMonths: 1,
        price: 1500,
        isActive: true,
      });

      try {
        const res = await request(app)
          .post('/api/v1/public/register')
          .send({
            firstName: 'Adult',
            lastName: 'Junior',
            email: 'adult@junior.com',
            password: 'securePassword123',
            dateOfBirth: '2000-01-01', // 26 years old
            tier: 'Junior',
            planId: 7,
            paymentMethod: 'upi',
          });

        assert.strictEqual(res.status, 422);
        assert.strictEqual(res.body.code, 'JUNIOR_AGE_VIOLATION');
      } finally {
        (prisma.member as any).findUnique = origMemberFind;
        (prisma.staff as any).findUnique = origStaffFind;
        (prisma.membershipPlan as any).findUnique = origPlanFind;
      }
    });

    it('should succeed with 201, create member, and return auth tokens', async () => {
      const origMemberFind = prisma.member.findUnique;
      const origStaffFind = prisma.staff.findUnique;
      const origPlanFind = prisma.membershipPlan.findUnique;
      const origTransaction = prisma.$transaction;

      (prisma.member as any).findUnique = async () => null;
      (prisma.staff as any).findUnique = async () => null;
      (prisma.membershipPlan as any).findUnique = async () => ({
        id: 5,
        tier: 'Silver',
        durationMonths: 6,
        price: 15000,
        isActive: true,
      });

      (prisma as any).$transaction = async (cb: any) => {
        const mockTx = {
          member: {
            create: async ({ data }: any) => ({
              id: 43,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          },
          memberAddress: {
            create: async () => ({ id: 1 }),
          },
          payment: {
            create: async () => ({ id: 1 }),
          },
        };
        return cb(mockTx);
      };

      try {
        const res = await request(app)
          .post('/api/v1/public/register')
          .send({
            firstName: 'Sarah',
            lastName: 'Connor',
            email: 'sarah.reg@example.com',
            password: 'securePassword123',
            tier: 'Silver',
            planId: 5,
            paymentMethod: 'upi',
            referenceNo: 'UPI-REF-12345',
            address: {
              addrLine1: '456 Park Avenue',
              city: 'Pune',
              state: 'Maharashtra',
              pincode: '411001',
            },
          });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.member.id, 43);
        assert.strictEqual(res.body.data.member.email, 'sarah.reg@example.com');
        assert.ok(res.body.data.accessToken);
        assert.strictEqual(res.body.data.expiresIn, 900);
      } finally {
        (prisma.member as any).findUnique = origMemberFind;
        (prisma.staff as any).findUnique = origStaffFind;
        (prisma.membershipPlan as any).findUnique = origPlanFind;
        (prisma as any).$transaction = origTransaction;
      }
    });
  });

  // ==========================================
  // LD-01 · GET /api/v1/leads
  // ==========================================
  describe('LD-01 · GET /api/v1/leads', () => {
    it('should reject with 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/v1/leads');
      assert.strictEqual(res.status, 401);
    });

    it('should reject with 403 when accessed by member role', async () => {
      const res = await request(app)
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${memberToken}`);

      assert.strictEqual(res.status, 403);
    });

    it('should succeed with 200 and return paginated leads for front_desk', async () => {
      const origCount = prisma.lead.count;
      const origFindMany = prisma.lead.findMany;

      (prisma.lead as any).count = async () => 1;
      (prisma.lead as any).findMany = async () => [
        {
          id: 1,
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          phone: '+919876543210',
          message: 'Trial enquiry',
          status: 'new',
          assignedTo: null,
          createdAt: new Date('2026-10-03T08:00:00Z'),
          updatedAt: new Date('2026-10-03T08:00:00Z'),
          staff: null,
        },
      ];

      try {
        const res = await request(app)
          .get('/api/v1/leads')
          .set('Authorization', `Bearer ${frontDeskToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.length, 1);
        assert.strictEqual(res.body.data[0].id, 1);
        assert.ok(res.body.pagination);
      } finally {
        (prisma.lead as any).count = origCount;
        (prisma.lead as any).findMany = origFindMany;
      }
    });
  });

  // ==========================================
  // LD-02 · GET /api/v1/leads/:id
  // ==========================================
  describe('LD-02 · GET /api/v1/leads/:id', () => {
    it('should reject with 404 when lead does not exist', async () => {
      const origFindUnique = prisma.lead.findUnique;
      (prisma.lead as any).findUnique = async () => null;

      try {
        const res = await request(app)
          .get('/api/v1/leads/999')
          .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.code, 'LEAD_NOT_FOUND');
      } finally {
        (prisma.lead as any).findUnique = origFindUnique;
      }
    });

    it('should succeed with 200 and return lead detail for admin', async () => {
      const origFindUnique = prisma.lead.findUnique;
      (prisma.lead as any).findUnique = async () => ({
        id: 10,
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        phone: '+919876543210',
        message: 'Interested in Silver tier',
        status: 'new',
        assignedTo: null,
        createdAt: new Date('2026-10-03T08:00:00Z'),
        updatedAt: new Date('2026-10-03T08:00:00Z'),
        staff: null,
      });

      try {
        const res = await request(app)
          .get('/api/v1/leads/10')
          .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.id, 10);
        assert.strictEqual(res.body.data.name, 'Sarah Connor');
      } finally {
        (prisma.lead as any).findUnique = origFindUnique;
      }
    });
  });

  // ==========================================
  // LD-03 · PUT /api/v1/leads/:id
  // ==========================================
  describe('LD-03 · PUT /api/v1/leads/:id', () => {
    it('should reject with 422 when transitioning from terminal state converted', async () => {
      const origFindUnique = prisma.lead.findUnique;
      (prisma.lead as any).findUnique = async () => ({
        id: 10,
        status: 'converted',
      });

      try {
        const res = await request(app)
          .put('/api/v1/leads/10')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'contacted' });

        assert.strictEqual(res.status, 422);
        assert.strictEqual(res.body.code, 'INVALID_STATE_TRANSITION');
      } finally {
        (prisma.lead as any).findUnique = origFindUnique;
      }
    });

    it('should succeed with 200 when updating status and assigning staff', async () => {
      const origLeadFind = prisma.lead.findUnique;
      const origStaffFind = prisma.staff.findUnique;
      const origUpdate = prisma.lead.update;

      (prisma.lead as any).findUnique = async () => ({
        id: 10,
        name: 'Sarah Connor',
        status: 'new',
      });
      (prisma.staff as any).findUnique = async () => ({
        id: 5,
        firstName: 'Jane',
        lastName: 'FrontDesk',
        isActive: true,
      });
      (prisma.lead as any).update = async ({ data }: any) => ({
        id: 10,
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        phone: '+919876543210',
        message: 'Enquiry',
        status: data.status,
        assignedTo: data.assignedTo,
        createdAt: new Date(),
        updatedAt: new Date(),
        staff: { id: 5, firstName: 'Jane', lastName: 'FrontDesk' },
      });

      try {
        const res = await request(app)
          .put('/api/v1/leads/10')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'contacted', assignedTo: 5 });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.status, 'contacted');
        assert.strictEqual(res.body.data.assignedTo, 5);
        assert.strictEqual(res.body.data.assignedStaffName, 'Jane FrontDesk');
      } finally {
        (prisma.lead as any).findUnique = origLeadFind;
        (prisma.staff as any).findUnique = origStaffFind;
        (prisma.lead as any).update = origUpdate;
      }
    });
  });
});
