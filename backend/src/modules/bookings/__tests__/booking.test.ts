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

const otherMemberToken = generateAccessToken({
  sub: 99,
  email: 'other@champions.club',
  role: 'member',
  tier: 'Silver',
});

describe('Bookings Module (Contracts BK-01 to BK-06)', () => {
  describe('BK-01 · GET /api/v1/bookings', () => {
    it('should reject with 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/v1/bookings');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('should return 200 with paginated bookings for admin', async () => {
      const origCount = prisma.booking.count;
      const origFindMany = prisma.booking.findMany;

      (prisma.booking as any).count = async () => 1;
      (prisma.booking as any).findMany = async () => [
        {
          id: 100,
          courtId: 1,
          memberId: 42,
          guestName: null,
          guestPhone: null,
          bookingType: 'member',
          slotStart: new Date('2026-10-03T12:00:00.000Z'),
          slotEnd: new Date('2026-10-03T13:00:00.000Z'),
          status: 'confirmed',
          amountPaid: 0,
          paymentMethod: 'plan',
          notes: 'Test booking',
          createdAt: new Date('2026-10-03T06:30:00.000Z'),
          court: { id: 1, name: 'Court A' },
          member: { id: 42, firstName: 'John', lastName: 'Doe' },
        },
      ];

      try {
        const res = await request(app)
          .get('/api/v1/bookings')
          .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.length, 1);
        assert.strictEqual(res.body.data[0].id, 100);
        assert.strictEqual(res.body.data[0].courtName, 'Court A');
        assert.strictEqual(res.body.data[0].memberName, 'John Doe');
        assert.strictEqual(res.body.data[0].amountPaidPaise, 0);
        assert.ok(res.body.pagination);
        assert.strictEqual(res.body.pagination.total, 1);
      } finally {
        (prisma.booking as any).count = origCount;
        (prisma.booking as any).findMany = origFindMany;
      }
    });

    it('should restrict member to only viewing own bookings', async () => {
      let queryFilter: any = null;
      const origCount = prisma.booking.count;
      const origFindMany = prisma.booking.findMany;

      (prisma.booking as any).count = async ({ where }: any) => {
        queryFilter = where;
        return 0;
      };
      (prisma.booking as any).findMany = async () => [];

      try {
        const res = await request(app)
          .get('/api/v1/bookings?memberId=99')
          .set('Authorization', `Bearer ${memberToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        // Verify member role overrides memberId query param to their own sub (42)
        assert.ok(queryFilter.OR);
        assert.strictEqual(queryFilter.OR[0].memberId, 42);
      } finally {
        (prisma.booking as any).count = origCount;
        (prisma.booking as any).findMany = origFindMany;
      }
    });
  });

  describe('BK-02 · POST /api/v1/bookings', () => {
    it('should reject with 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .send({
          courtId: 1,
          slotStart: '2026-10-03T12:00:00.000Z',
          slotEnd: '2026-10-03T13:00:00.000Z',
          bookingType: 'member',
          paymentMethod: 'plan',
        });

      assert.strictEqual(res.status, 401);
    });

    it('should reject with 400 when slotStart is not aligned to 30-min boundary', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          courtId: 1,
          memberId: 42,
          slotStart: '2026-10-03T12:15:00.000Z',
          slotEnd: '2026-10-03T13:15:00.000Z',
          bookingType: 'member',
          paymentMethod: 'plan',
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should reject with 400 when slotEnd is not exactly 60 minutes after slotStart', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          courtId: 1,
          memberId: 42,
          slotStart: '2026-10-03T12:00:00.000Z',
          slotEnd: '2026-10-03T13:30:00.000Z',
          bookingType: 'member',
          paymentMethod: 'plan',
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should reject with 403 when member tries to create walk_in booking', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          courtId: 1,
          guestName: 'Jane Smith',
          slotStart: '2026-10-03T12:00:00.000Z',
          slotEnd: '2026-10-03T13:00:00.000Z',
          bookingType: 'walk_in',
          paymentMethod: 'cash',
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.code, 'FORBIDDEN');
    });

    it('should reject with 403 when member tries to book for another member', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          courtId: 1,
          memberId: 99,
          slotStart: '2026-10-03T12:00:00.000Z',
          slotEnd: '2026-10-03T13:00:00.000Z',
          bookingType: 'member',
          paymentMethod: 'plan',
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.code, 'FORBIDDEN');
    });

    it('should reject with 404 when court does not exist or is inactive', async () => {
      const origFindUnique = prisma.court.findUnique;
      (prisma.court as any).findUnique = async () => null;

      try {
        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({
            courtId: 999,
            memberId: 42,
            slotStart: '2026-10-03T12:00:00.000Z',
            slotEnd: '2026-10-03T13:00:00.000Z',
            bookingType: 'member',
            paymentMethod: 'plan',
          });

        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.code, 'COURT_NOT_FOUND');
      } finally {
        (prisma.court as any).findUnique = origFindUnique;
      }
    });

    it('should reject with 422 when member membership is expired', async () => {
      const origCourt = prisma.court.findUnique;
      const origMember = prisma.member.findUnique;

      (prisma.court as any).findUnique = async () => ({ id: 1, isActive: true });
      (prisma.member as any).findUnique = async () => ({
        id: 42,
        firstName: 'John',
        lastName: 'Doe',
        status: 'expired',
        tier: 'Gold',
      });

      try {
        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({
            courtId: 1,
            memberId: 42,
            slotStart: '2026-10-03T12:00:00.000Z',
            slotEnd: '2026-10-03T13:00:00.000Z',
            bookingType: 'member',
            paymentMethod: 'plan',
          });

        assert.strictEqual(res.status, 422);
        assert.strictEqual(res.body.code, 'MEMBERSHIP_EXPIRED');
      } finally {
        (prisma.court as any).findUnique = origCourt;
        (prisma.member as any).findUnique = origMember;
      }
    });

    it('should reject with 422 when daily limit of 2 bookings is exceeded', async () => {
      const origCourt = prisma.court.findUnique;
      const origMember = prisma.member.findUnique;
      const origCount = prisma.booking.count;

      (prisma.court as any).findUnique = async () => ({ id: 1, isActive: true });
      (prisma.member as any).findUnique = async () => ({
        id: 42,
        firstName: 'John',
        lastName: 'Doe',
        status: 'active',
        tier: 'Gold',
      });
      (prisma.booking as any).count = async () => 2;

      try {
        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({
            courtId: 1,
            memberId: 42,
            slotStart: '2026-10-03T12:00:00.000Z',
            slotEnd: '2026-10-03T13:00:00.000Z',
            bookingType: 'member',
            paymentMethod: 'plan',
          });

        assert.strictEqual(res.status, 422);
        assert.strictEqual(res.body.code, 'DAILY_LIMIT_EXCEEDED');
      } finally {
        (prisma.court as any).findUnique = origCourt;
        (prisma.member as any).findUnique = origMember;
        (prisma.booking as any).count = origCount;
      }
    });

    it('should reject with 409 when court slot conflicts with existing confirmed booking', async () => {
      const origCourt = prisma.court.findUnique;
      const origMember = prisma.member.findUnique;
      const origCount = prisma.booking.count;
      const origFindFirst = prisma.booking.findFirst;

      (prisma.court as any).findUnique = async () => ({ id: 1, isActive: true });
      (prisma.member as any).findUnique = async () => ({
        id: 42,
        firstName: 'John',
        lastName: 'Doe',
        status: 'active',
        tier: 'Gold',
      });
      (prisma.booking as any).count = async () => 0;
      (prisma.booking as any).findFirst = async () => ({ id: 99 });

      try {
        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({
            courtId: 1,
            memberId: 42,
            slotStart: '2026-10-03T12:00:00.000Z',
            slotEnd: '2026-10-03T13:00:00.000Z',
            bookingType: 'member',
            paymentMethod: 'plan',
          });

        assert.strictEqual(res.status, 409);
        assert.strictEqual(res.body.code, 'SLOT_CONFLICT');
      } finally {
        (prisma.court as any).findUnique = origCourt;
        (prisma.member as any).findUnique = origMember;
        (prisma.booking as any).count = origCount;
        (prisma.booking as any).findFirst = origFindFirst;
      }
    });

    it('should succeed with 201 when booking court for Gold member (0 paise)', async () => {
      const origCourt = prisma.court.findUnique;
      const origMember = prisma.member.findUnique;
      const origCount = prisma.booking.count;
      const origFindFirst = prisma.booking.findFirst;
      const origTransaction = prisma.$transaction;

      (prisma.court as any).findUnique = async () => ({ id: 1, name: 'Centre Court', isActive: true });
      (prisma.member as any).findUnique = async () => ({
        id: 42,
        firstName: 'John',
        lastName: 'Doe',
        status: 'active',
        tier: 'Gold',
      });
      (prisma.booking as any).count = async () => 0;
      (prisma.booking as any).findFirst = async () => null;

      (prisma as any).$transaction = async (cb: any) => {
        const mockTx = {
          booking: {
            create: async ({ data }: any) => ({
              id: 101,
              ...data,
              court: { id: 1, name: 'Centre Court' },
              member: { id: 42, firstName: 'John', lastName: 'Doe' },
              createdAt: new Date('2026-10-03T06:00:00.000Z'),
            }),
          },
          payment: {
            create: async () => ({ id: 1 }),
          },
        };
        return cb(mockTx);
      };

      try {
        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({
            courtId: 1,
            memberId: 42,
            slotStart: '2026-10-03T12:00:00.000Z',
            slotEnd: '2026-10-03T13:00:00.000Z',
            bookingType: 'member',
            paymentMethod: 'plan',
          });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.id, 101);
        assert.strictEqual(res.body.data.amountPaidPaise, 0);
        assert.strictEqual(res.body.data.courtName, 'Centre Court');
      } finally {
        (prisma.court as any).findUnique = origCourt;
        (prisma.member as any).findUnique = origMember;
        (prisma.booking as any).count = origCount;
        (prisma.booking as any).findFirst = origFindFirst;
        (prisma as any).$transaction = origTransaction;
      }
    });

    it('should succeed with 201 when admin creates walk_in booking (50000 paise)', async () => {
      const origCourt = prisma.court.findUnique;
      const origFindFirst = prisma.booking.findFirst;
      const origTransaction = prisma.$transaction;

      (prisma.court as any).findUnique = async () => ({ id: 1, name: 'Centre Court', isActive: true });
      (prisma.booking as any).findFirst = async () => null;

      (prisma as any).$transaction = async (cb: any) => {
        const mockTx = {
          booking: {
            create: async ({ data }: any) => ({
              id: 102,
              ...data,
              court: { id: 1, name: 'Centre Court' },
              member: null,
              createdAt: new Date('2026-10-03T06:00:00.000Z'),
            }),
          },
          payment: {
            create: async () => ({ id: 2 }),
          },
        };
        return cb(mockTx);
      };

      try {
        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            courtId: 1,
            guestName: 'Jane Smith',
            guestPhone: '+919876543210',
            slotStart: '2026-10-03T14:00:00.000Z',
            slotEnd: '2026-10-03T15:00:00.000Z',
            bookingType: 'walk_in',
            paymentMethod: 'cash',
          });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.id, 102);
        assert.strictEqual(res.body.data.bookingType, 'walk_in');
        assert.strictEqual(res.body.data.amountPaidPaise, 50000);
      } finally {
        (prisma.court as any).findUnique = origCourt;
        (prisma.booking as any).findFirst = origFindFirst;
        (prisma as any).$transaction = origTransaction;
      }
    });
  });

  describe('BK-03 · GET /api/v1/bookings/:id', () => {
    it('should reject with 404 when booking does not exist', async () => {
      const origFindUnique = prisma.booking.findUnique;
      (prisma.booking as any).findUnique = async () => null;

      try {
        const res = await request(app)
          .get('/api/v1/bookings/999')
          .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.code, 'BOOKING_NOT_FOUND');
      } finally {
        (prisma.booking as any).findUnique = origFindUnique;
      }
    });

    it('should reject with 403 when member tries to view another member booking', async () => {
      const origFindUnique = prisma.booking.findUnique;
      (prisma.booking as any).findUnique = async () => ({
        id: 100,
        memberId: 42,
        courtId: 1,
        slotStart: new Date(),
        slotEnd: new Date(),
        status: 'confirmed',
        amountPaid: 0,
        createdAt: new Date(),
        participants: [],
      });

      try {
        const res = await request(app)
          .get('/api/v1/bookings/100')
          .set('Authorization', `Bearer ${otherMemberToken}`);

        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.code, 'FORBIDDEN');
      } finally {
        (prisma.booking as any).findUnique = origFindUnique;
      }
    });

    it('should succeed with 200 when member views own booking', async () => {
      const origFindUnique = prisma.booking.findUnique;
      (prisma.booking as any).findUnique = async () => ({
        id: 100,
        memberId: 42,
        courtId: 1,
        slotStart: new Date('2026-10-03T12:00:00.000Z'),
        slotEnd: new Date('2026-10-03T13:00:00.000Z'),
        bookingType: 'member',
        status: 'confirmed',
        amountPaid: 0,
        createdAt: new Date('2026-10-03T06:00:00.000Z'),
        court: { id: 1, name: 'Centre Court' },
        member: { id: 42, firstName: 'John', lastName: 'Doe' },
        participants: [],
      });

      try {
        const res = await request(app)
          .get('/api/v1/bookings/100')
          .set('Authorization', `Bearer ${memberToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.id, 100);
        assert.strictEqual(res.body.data.memberName, 'John Doe');
      } finally {
        (prisma.booking as any).findUnique = origFindUnique;
      }
    });
  });

  describe('BK-04 · PUT /api/v1/bookings/:id/cancel', () => {
    it('should reject with 404 when booking does not exist', async () => {
      const origFindUnique = prisma.booking.findUnique;
      (prisma.booking as any).findUnique = async () => null;

      try {
        const res = await request(app)
          .put('/api/v1/bookings/999/cancel')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ reason: 'Rain' });

        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.code, 'BOOKING_NOT_FOUND');
      } finally {
        (prisma.booking as any).findUnique = origFindUnique;
      }
    });

    it('should reject with 403 when member tries to cancel another member booking', async () => {
      const origFindUnique = prisma.booking.findUnique;
      (prisma.booking as any).findUnique = async () => ({
        id: 100,
        memberId: 42,
        status: 'confirmed',
      });

      try {
        const res = await request(app)
          .put('/api/v1/bookings/100/cancel')
          .set('Authorization', `Bearer ${otherMemberToken}`)
          .send({ reason: 'Cannot make it' });

        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.code, 'FORBIDDEN');
      } finally {
        (prisma.booking as any).findUnique = origFindUnique;
      }
    });

    it('should reject with 422 when booking is already cancelled', async () => {
      const origFindUnique = prisma.booking.findUnique;
      (prisma.booking as any).findUnique = async () => ({
        id: 100,
        memberId: 42,
        status: 'cancelled',
      });

      try {
        const res = await request(app)
          .put('/api/v1/bookings/100/cancel')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ reason: 'Already cancelled' });

        assert.strictEqual(res.status, 422);
        assert.strictEqual(res.body.code, 'INVALID_STATE_TRANSITION');
      } finally {
        (prisma.booking as any).findUnique = origFindUnique;
      }
    });

    it('should succeed with 200 and set status to cancelled', async () => {
      const origFindUnique = prisma.booking.findUnique;
      const origUpdate = prisma.booking.update;

      (prisma.booking as any).findUnique = async () => ({
        id: 100,
        courtId: 1,
        memberId: 42,
        status: 'confirmed',
        slotStart: new Date('2026-10-03T12:00:00.000Z'),
        slotEnd: new Date('2026-10-03T13:00:00.000Z'),
      });

      (prisma.booking as any).update = async ({ data }: any) => ({
        id: 100,
        courtId: 1,
        memberId: 42,
        status: data.status,
        notes: data.notes,
        slotStart: new Date('2026-10-03T12:00:00.000Z'),
        slotEnd: new Date('2026-10-03T13:00:00.000Z'),
        bookingType: 'member',
        amountPaid: 0,
        createdAt: new Date('2026-10-03T06:00:00.000Z'),
        court: { id: 1, name: 'Centre Court' },
        member: { id: 42, firstName: 'John', lastName: 'Doe' },
      });

      try {
        const res = await request(app)
          .put('/api/v1/bookings/100/cancel')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ reason: 'Schedule conflict' });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.status, 'cancelled');
      } finally {
        (prisma.booking as any).findUnique = origFindUnique;
        (prisma.booking as any).update = origUpdate;
      }
    });
  });

  describe('BK-05 · POST /api/v1/bookings/social', () => {
    it('should reject with 403 when member tries to create social booking', async () => {
      const res = await request(app)
        .post('/api/v1/bookings/social')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          courtId: 1,
          slotStart: '2026-10-03T16:00:00.000Z',
          slotEnd: '2026-10-03T17:00:00.000Z',
          paymentMethod: 'cash',
          participants: [{ memberId: 42 }, { guestName: 'Jane Smith' }],
        });

      assert.strictEqual(res.status, 403);
    });

    it('should reject with 400 when fewer than 2 participants', async () => {
      const res = await request(app)
        .post('/api/v1/bookings/social')
        .set('Authorization', `Bearer ${frontDeskToken}`)
        .send({
          courtId: 1,
          slotStart: '2026-10-03T16:00:00.000Z',
          slotEnd: '2026-10-03T17:00:00.000Z',
          paymentMethod: 'cash',
          participants: [{ memberId: 42 }],
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should succeed with 201 for front_desk creating social booking with flat ₹150/person', async () => {
      const origCourt = prisma.court.findUnique;
      const origMember = prisma.member.findUnique;
      const origCount = prisma.booking.count;
      const origFindFirst = prisma.booking.findFirst;
      const origTransaction = prisma.$transaction;

      (prisma.court as any).findUnique = async () => ({ id: 1, name: 'Centre Court', isActive: true });
      (prisma.member as any).findUnique = async () => ({
        id: 42,
        firstName: 'John',
        lastName: 'Doe',
        status: 'active',
      });
      (prisma.booking as any).count = async () => 0;
      (prisma.booking as any).findFirst = async () => null;

      (prisma as any).$transaction = async (cb: any) => {
        const mockTx = {
          booking: {
            create: async ({ data }: any) => ({ id: 200, ...data }),
            findUnique: async () => ({
              id: 200,
              courtId: 1,
              bookingType: 'social',
              slotStart: new Date('2026-10-03T16:00:00.000Z'),
              slotEnd: new Date('2026-10-03T17:00:00.000Z'),
              status: 'confirmed',
              amountPaid: 600,
              createdAt: new Date('2026-10-03T06:00:00.000Z'),
              court: { id: 1, name: 'Centre Court' },
              participants: [
                { id: 1, memberId: 42, guestName: null, member: { firstName: 'John', lastName: 'Doe' } },
                { id: 2, memberId: null, guestName: 'Jane Smith', member: null },
                { id: 3, memberId: null, guestName: 'Bob Jones', member: null },
                { id: 4, memberId: null, guestName: 'Alice Ray', member: null },
              ],
            }),
          },
          bookingParticipant: {
            createMany: async () => ({ count: 4 }),
          },
          payment: {
            create: async () => ({ id: 10 }),
          },
        };
        return cb(mockTx);
      };

      try {
        const res = await request(app)
          .post('/api/v1/bookings/social')
          .set('Authorization', `Bearer ${frontDeskToken}`)
          .send({
            courtId: 1,
            slotStart: '2026-10-03T16:00:00.000Z',
            slotEnd: '2026-10-03T17:00:00.000Z',
            paymentMethod: 'cash',
            participants: [
              { memberId: 42 },
              { guestName: 'Jane Smith' },
              { guestName: 'Bob Jones' },
              { guestName: 'Alice Ray' },
            ],
          });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.id, 200);
        assert.strictEqual(res.body.data.bookingType, 'social');
        assert.strictEqual(res.body.data.amountPaidPaise, 60000); // 4 * 15000 = 60000 paise (₹600)
        assert.strictEqual(res.body.data.participantCount, 4);
      } finally {
        (prisma.court as any).findUnique = origCourt;
        (prisma.member as any).findUnique = origMember;
        (prisma.booking as any).count = origCount;
        (prisma.booking as any).findFirst = origFindFirst;
        (prisma as any).$transaction = origTransaction;
      }
    });
  });

  describe('BK-06 · GET /api/v1/bookings/today', () => {
    it('should reject with 403 when member tries to access today dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/today')
        .set('Authorization', `Bearer ${memberToken}`);

      assert.strictEqual(res.status, 403);
    });

    it('should return 200 with bookings grouped by court for front_desk', async () => {
      const origCourt = prisma.court.findMany;
      const origBooking = prisma.booking.findMany;

      (prisma.court as any).findMany = async () => [
        { id: 1, name: 'Centre Court', sport: 'tennis', isActive: true },
      ];
      (prisma.booking as any).findMany = async () => [
        {
          id: 100,
          courtId: 1,
          slotStart: new Date('2026-10-03T06:00:00.000Z'),
          slotEnd: new Date('2026-10-03T07:00:00.000Z'),
          bookingType: 'member',
          status: 'confirmed',
          member: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      try {
        const res = await request(app)
          .get('/api/v1/bookings/today?date=2026-10-03')
          .set('Authorization', `Bearer ${frontDeskToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.date, '2026-10-03');
        assert.strictEqual(res.body.data.courts.length, 1);
        assert.strictEqual(res.body.data.courts[0].courtName, 'Centre Court');
        assert.strictEqual(res.body.data.courts[0].bookings.length, 1);
        assert.strictEqual(res.body.data.courts[0].bookings[0].memberName, 'John Doe');
      } finally {
        (prisma.court as any).findMany = origCourt;
        (prisma.booking as any).findMany = origBooking;
      }
    });
  });
});
