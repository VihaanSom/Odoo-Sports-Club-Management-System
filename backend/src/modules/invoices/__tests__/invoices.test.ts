import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { invoicesService } from '../invoices.service';

describe('Invoices Module Tests', () => {
  describe('IN-01: Members due for renewal', () => {
    it('should list members due for renewal', async () => {
      const list = await invoicesService.getMembersDueForRenewal();
      assert.ok(Array.isArray(list));
      if (list.length > 0) {
        const item = list[0];
        assert.ok(item.memberId);
        assert.ok(item.firstName);
        assert.ok(item.tier);
        assert.strictEqual(typeof item.daysRemaining, 'number');
      }
    });
  });

  describe('IN-02: Generate membership invoice', () => {
    it('should throw NOT_FOUND for non-existent member', async () => {
      await assert.rejects(
        async () => {
          await invoicesService.generateMemberInvoice(99999999);
        },
        {
          name: 'NotFoundError',
        }
      );
    });
  });
});
