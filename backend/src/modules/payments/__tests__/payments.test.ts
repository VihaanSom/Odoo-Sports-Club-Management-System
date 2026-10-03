import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../../app';
import { generateAccessToken } from '../../../utils/token';

const app = createApp();

const adminToken = generateAccessToken({
  sub: 1,
  email: 'admin@champions.club',
  role: 'admin',
});

const memberToken = generateAccessToken({
  sub: 42,
  email: 'john@champions.club',
  role: 'member',
});

describe('Payments Module (Contract PM-01)', () => {
  it('should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/payments');
    assert.strictEqual(res.status, 401);
  });

  it('should reject non-admin user with 403', async () => {
    const res = await request(app)
      .get('/api/v1/payments')
      .set('Authorization', `Bearer ${memberToken}`);
    assert.strictEqual(res.status, 403);
  });

  it('should return paginated payment ledger for admin', async () => {
    const res = await request(app)
      .get('/api/v1/payments?page=1&pageSize=10')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);
    assert.strictEqual(res.body.pagination.page, 1);
    assert.strictEqual(res.body.pagination.pageSize, 10);
  });
});
