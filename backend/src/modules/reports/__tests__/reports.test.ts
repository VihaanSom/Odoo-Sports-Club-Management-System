import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reportsService } from '../reports.service';

describe('Reports Module Logic Tests', () => {
  describe('RP-01: Revenue Report', () => {
    it('should calculate revenue aggregation and time series without throwing', async () => {
      const result = await reportsService.getRevenueReport({
        from: '2026-01-01',
        to: '2026-12-31',
        granularity: 'month',
      });

      assert.ok(result);
      assert.ok(result.summary);
      assert.strictEqual(typeof result.summary.totalPaise, 'number');
      assert.strictEqual(typeof result.summary.courtsPaise, 'number');
      assert.strictEqual(typeof result.summary.shopPaise, 'number');
      assert.strictEqual(typeof result.summary.barPaise, 'number');
      assert.ok(result.byPaymentMethod);
      assert.ok(Array.isArray(result.timeSeries));
    });
  });

  describe('RP-02: Court Utilisation Report', () => {
    it('should return court utilisation metrics', async () => {
      const result = await reportsService.getCourtsUtilisationReport({
        from: '2026-10-01',
        to: '2026-10-31',
      });

      assert.ok(result);
      assert.ok(result.summary);
      assert.strictEqual(typeof result.summary.totalCourts, 'number');
      assert.strictEqual(typeof result.summary.overallUtilisationPct, 'number');
      assert.ok(Array.isArray(result.courts));
    });
  });

  describe('RP-03: Member Analytics Report', () => {
    it('should return member breakdown by tier', async () => {
      const result = await reportsService.getMembersReport({
        from: '2026-01-01',
        to: '2026-12-31',
      });

      assert.ok(result);
      assert.ok(result.newSignups);
      assert.ok(result.expirations);
      assert.ok(result.activeMembers);
      assert.strictEqual(typeof result.totalMembers, 'number');
    });
  });

  describe('RP-04: Inventory Report', () => {
    it('should return top-selling products and low stock alerts', async () => {
      const result = await reportsService.getInventoryReport({});

      assert.ok(result);
      assert.ok(Array.isArray(result.topSellingEquipment));
      assert.ok(Array.isArray(result.topSellingMenuItems));
      assert.ok(result.lowStockAlerts);
    });
  });

  describe('RP-05: Bar Earnings Report', () => {
    it('should return daily bar summary', async () => {
      const result = await reportsService.getBarReport({
        date: '2026-10-03',
      });

      assert.ok(result);
      assert.strictEqual(typeof result.totalEarningsPaise, 'number');
      assert.strictEqual(typeof result.settledTabsCount, 'number');
      assert.ok(Array.isArray(result.topSellingItems));
      assert.ok(Array.isArray(result.staffBreakdown));
    });
  });

  describe('RP-06: Staff Report', () => {
    it('should return staff shift hours and leave balances', async () => {
      const result = await reportsService.getStaffReport({
        from: '2026-10-01',
        to: '2026-10-31',
      });

      assert.ok(Array.isArray(result));
    });
  });
});
