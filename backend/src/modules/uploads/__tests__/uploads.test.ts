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

describe('Uploads Module (Contract UP-01)', () => {
  it('should reject unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/v1/uploads');
    assert.strictEqual(res.status, 401);
  });

  it('should reject request when no file is uploaded', async () => {
    const res = await request(app)
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(res.status, 400);
  });

  it('should upload valid image successfully', async () => {
    const dummyImageBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xd9,
    ]);

    const res = await request(app)
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('category', 'member')
      .attach('file', dummyImageBuffer, 'test.jpg');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.url.startsWith('/uploads/member/'));
    assert.ok(res.body.data.filename);
    assert.strictEqual(res.body.data.mimeType, 'image/jpeg');
  });
});
