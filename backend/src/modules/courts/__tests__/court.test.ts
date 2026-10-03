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
  sub: 10,
  email: 'member@champions.club',
  role: 'member',
  tier: 'Gold',
});

describe('Courts Module (Contracts CO-01 to CO-04)', () => {
  describe('CO-01 · GET /api/v1/courts', () => {
    it('should reject with 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/v1/courts');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('should reject with 403 when accessed by member role', async () => {
      const res = await request(app)
        .get('/api/v1/courts')
        .set('Authorization', `Bearer ${memberToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('should return 200 with courts when accessed by front_desk', async () => {
      const origFindMany = prisma.court.findMany;
      (prisma.court as any).findMany = async () => [
        {
          id: 1,
          name: 'Court 1',
          sport: 'tennis',
          openTime: '06:00',
          closeTime: '22:00',
          isActive: true,
        },
      ];

      try {
        const res = await request(app)
          .get('/api/v1/courts')
          .set('Authorization', `Bearer ${frontDeskToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.length, 1);
        assert.strictEqual(res.body.data[0].name, 'Court 1');
      } finally {
        (prisma.court as any).findMany = origFindMany;
      }
    });
  });

  describe('CO-02 · GET /api/v1/courts/availability', () => {
    it('should reject with 400 when date query param is missing or malformed', async () => {
      const res = await request(app)
        .get('/api/v1/courts/availability?date=invalid-date')
        .set('Authorization', `Bearer ${memberToken}`);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should permit members to query court availability and accurately reflect booked vs free slots', async () => {
      const origCourtFindMany = prisma.court.findMany;
      const origBookingFindMany = prisma.booking.findMany;

      (prisma.court as any).findMany = async () => [
        {
          id: 1,
          name: 'Centre Court',
          sport: 'tennis',
          openTime: '06:00',
          closeTime: '08:00',
          isActive: true,
        },
      ];

      // Simulate an existing confirmed booking from 06:30 to 07:30 UTC
      (prisma.booking as any).findMany = async () => [
        {
          courtId: 1,
          slotStart: new Date('2026-10-03T06:30:00.000Z'),
          slotEnd: new Date('2026-10-03T07:30:00.000Z'),
          bookingType: 'member',
        },
      ];

      try {
        const res = await request(app)
          .get('/api/v1/courts/availability?date=2026-10-03')
          .set('Authorization', `Bearer ${memberToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.length, 1);

        const courtAvailability = res.body.data[0];
        assert.strictEqual(courtAvailability.courtId, 1);

        // For 06:00 to 08:00 with 60-min slots:
        // Slot 1: 06:00 - 07:00 -> Overlaps with 06:30 - 07:30 -> BOOKED
        // Slot 2: 06:30 - 07:30 -> Overlaps with 06:30 - 07:30 -> BOOKED
        // Slot 3: 07:00 - 08:00 -> Overlaps with 06:30 - 07:30 -> BOOKED
        const slot1 = courtAvailability.slots.find(
          (s: any) => s.slotStart === '2026-10-03T06:00:00.000Z'
        );
        assert.ok(slot1);
        assert.strictEqual(slot1.status, 'booked');
        assert.strictEqual(slot1.bookingType, 'member');

        const slot2 = courtAvailability.slots.find(
          (s: any) => s.slotStart === '2026-10-03T06:30:00.000Z'
        );
        assert.ok(slot2);
        assert.strictEqual(slot2.status, 'booked');
      } finally {
        (prisma.court as any).findMany = origCourtFindMany;
        (prisma.booking as any).findMany = origBookingFindMany;
      }
    });
  });

  describe('CO-03 · POST /api/v1/courts', () => {
    it('should reject with 403 when non-admin attempts to create court', async () => {
      const res = await request(app)
        .post('/api/v1/courts')
        .set('Authorization', `Bearer ${frontDeskToken}`)
        .send({ name: 'Court 2', sport: 'tennis' });

      assert.strictEqual(res.status, 403);
    });

    it('should reject with 400 when closeTime <= openTime', async () => {
      const res = await request(app)
        .post('/api/v1/courts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Court Invalid',
          sport: 'tennis',
          openTime: '18:00',
          closeTime: '09:00',
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should succeed with 201 when admin creates valid court', async () => {
      const origCreate = prisma.court.create;
      (prisma.court as any).create = async ({ data }: any) => ({
        id: 99,
        ...data,
      });

      try {
        const res = await request(app)
          .post('/api/v1/courts')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'New Tennis Court',
            sport: 'tennis',
            openTime: '06:00',
            closeTime: '22:00',
          });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.id, 99);
        assert.strictEqual(res.body.data.name, 'New Tennis Court');
      } finally {
        (prisma.court as any).create = origCreate;
      }
    });
  });

  describe('CO-04 · PUT /api/v1/courts/:id', () => {
    it('should reject with 404 when court does not exist', async () => {
      const origFindUnique = prisma.court.findUnique;
      (prisma.court as any).findUnique = async () => null;

      try {
        const res = await request(app)
          .put('/api/v1/courts/999')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Renamed Court' });

        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.code, 'COURT_NOT_FOUND');
      } finally {
        (prisma.court as any).findUnique = origFindUnique;
      }
    });

    it('should succeed with 200 when admin updates existing court', async () => {
      const origFindUnique = prisma.court.findUnique;
      const origUpdate = prisma.court.update;

      (prisma.court as any).findUnique = async () => ({
        id: 1,
        name: 'Court A',
        sport: 'tennis',
        openTime: '06:00',
        closeTime: '22:00',
        isActive: true,
      });

      (prisma.court as any).update = async ({ data }: any) => ({
        id: 1,
        name: data.name ?? 'Court A',
        sport: 'tennis',
        openTime: data.openTime ?? '06:00',
        closeTime: data.closeTime ?? '22:00',
        isActive: data.isActive ?? true,
      });

      try {
        const res = await request(app)
          .put('/api/v1/courts/1')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Court A (Renovated)', isActive: false });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.name, 'Court A (Renovated)');
        assert.strictEqual(res.body.data.isActive, false);
      } finally {
        (prisma.court as any).findUnique = origFindUnique;
        (prisma.court as any).update = origUpdate;
      }
    });
  });
});
