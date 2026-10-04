import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../../app';
import { prisma } from '../../../config/prisma';
import { generateAccessToken } from '../../../utils/token';
import { formatTabDetail } from '../tabs/tabs.service';

const app = createApp();

const adminToken = generateAccessToken({
  sub: 1,
  email: 'admin@champions.club',
  role: 'admin',
});

const barToken = generateAccessToken({
  sub: 3,
  email: 'bartender@champions.club',
  role: 'bar',
});

const memberToken = generateAccessToken({
  sub: 42,
  email: 'member@champions.club',
  role: 'member',
});

describe('Bar Module (Bug #17: Member Discount & Today Earnings)', () => {
  describe('formatTabDetail discount computation', () => {
    it('should calculate 15% discount for Gold tier member on open tab', () => {
      const mockTab = {
        id: 10,
        barTableId: 1,
        table: { tableNo: 'T1' },
        memberId: 5,
        member: { firstName: 'Alice', lastName: 'Smith', tier: 'Gold' },
        staff: { firstName: 'Bob', lastName: 'Barker' },
        openedBy: 2,
        status: 'open',
        openedAt: new Date(),
        items: [
          { id: 1, menuItemId: 101, unitPrice: '200.00', subtotal: '200.00', qty: 1 },
          { id: 2, menuItemId: 102, unitPrice: '100.00', subtotal: '200.00', qty: 2 },
        ],
      };

      const result = formatTabDetail(mockTab);
      assert.strictEqual(result.subtotalPaise, 40000); // 400.00 Rs
      assert.strictEqual(result.discountPct, 15);
      assert.strictEqual(result.discountPaise, 6000); // 15% of 40000 = 6000
      assert.strictEqual(result.totalPaise, 34000); // 40000 - 6000 = 34000
      assert.strictEqual(result.memberName, 'Alice Smith');
      assert.strictEqual(result.memberTier, 'Gold');
    });

    it('should calculate 10% discount for Silver tier and 5% for Junior tier', () => {
      const silverTab = {
        id: 11,
        barTableId: 2,
        table: { tableNo: 'T2' },
        memberId: 6,
        member: { firstName: 'Charlie', lastName: 'Day', tier: 'Silver' },
        status: 'open',
        openedAt: new Date(),
        items: [{ id: 1, menuItemId: 101, unitPrice: '100.00', subtotal: '100.00', qty: 1 }],
      };

      const silverResult = formatTabDetail(silverTab);
      assert.strictEqual(silverResult.subtotalPaise, 10000);
      assert.strictEqual(silverResult.discountPaise, 1000);
      assert.strictEqual(silverResult.totalPaise, 9000);

      const juniorTab = {
        ...silverTab,
        member: { firstName: 'Junior', lastName: 'Member', tier: 'Junior' },
      };
      const juniorResult = formatTabDetail(juniorTab);
      assert.strictEqual(juniorResult.discountPaise, 500);
      assert.strictEqual(juniorResult.totalPaise, 9500);
    });

    it('should apply 0% discount for non-members / walk-in guests', () => {
      const walkInTab = {
        id: 12,
        barTableId: 3,
        table: { tableNo: 'T3' },
        memberId: null,
        member: null,
        status: 'open',
        openedAt: new Date(),
        items: [{ id: 1, menuItemId: 101, unitPrice: '100.00', subtotal: '100.00', qty: 1 }],
      };

      const result = formatTabDetail(walkInTab);
      assert.strictEqual(result.subtotalPaise, 10000);
      assert.strictEqual(result.discountPaise, 0);
      assert.strictEqual(result.totalPaise, 10000);
      assert.strictEqual(result.memberName, null);
    });
  });

  describe('GET /api/v1/bar/earnings/today', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/v1/bar/earnings/today');
      assert.strictEqual(res.status, 401);
    });

    it('should return 403 when accessed by member role', async () => {
      const res = await request(app)
        .get('/api/v1/bar/earnings/today')
        .set('Authorization', `Bearer ${memberToken}`);
      assert.strictEqual(res.status, 403);
    });

    it('should return 200 with today earnings aggregated from bar payments', async () => {
      const origFindMany = prisma.payment.findMany;
      (prisma.payment as any).findMany = async () => [
        { amount: '340.00', barTabId: 10 },
        { amount: '160.00', barTabId: 11 },
        { amount: '200.00', barTabId: 10 }, // 2 payments for same tab
      ];

      try {
        const res = await request(app)
          .get('/api/v1/bar/earnings/today')
          .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.totalPaise, 70000);
        assert.strictEqual(res.body.data.totalRupees, 700);
        assert.strictEqual(res.body.data.settledTabsCount, 2);
        assert.ok(res.body.data.date);
      } finally {
        (prisma.payment as any).findMany = origFindMany;
      }
    });

    it('should also work on GET /api/v1/bar/tabs/earnings/today for backward compatibility', async () => {
      const origFindMany = prisma.payment.findMany;
      (prisma.payment as any).findMany = async () => [
        { amount: '500.00', barTabId: 25 },
      ];

      try {
        const res = await request(app)
          .get('/api/v1/bar/tabs/earnings/today')
          .set('Authorization', `Bearer ${barToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data.totalPaise, 50000);
        assert.strictEqual(res.body.data.settledTabsCount, 1);
      } finally {
        (prisma.payment as any).findMany = origFindMany;
      }
    });
  });
});
