import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../../app';
import { prisma } from '../../../config/prisma';
import { generateAccessToken, generateRefreshToken } from '../../../utils/token';

const app = createApp();

describe('Auth Module (Contracts AU-01 to AU-04)', () => {
  describe('AU-01 · POST /api/v1/auth/login', () => {
    it('should reject with 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should reject with 400 when password is shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@test.com', password: '123' });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.code, 'VALIDATION_ERROR');
    });

    it('should reject with 401 for non-existent user credentials', async () => {
      // Mock database lookup returning null (user not found)
      const memberFindUnique = prisma.member.findUnique;
      const staffFindUnique = prisma.staff.findUnique;

      (prisma.member as any).findUnique = async () => null;
      (prisma.staff as any).findUnique = async () => null;

      try {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'nonexistent_user_999@test.com', password: 'password123' });

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.code, 'INVALID_CREDENTIALS');
        assert.strictEqual(res.body.message, 'Invalid email or password');
      } finally {
        (prisma.member as any).findUnique = memberFindUnique;
        (prisma.staff as any).findUnique = staffFindUnique;
      }
    });

    it('should reject with 403 ACCOUNT_INACTIVE when member status is expired', async () => {
      const memberFindUnique = prisma.member.findUnique;
      (prisma.member as any).findUnique = async () => ({
        id: 1,
        email: 'expired@test.com',
        passwordHash: 'dummy',
        status: 'expired',
        tier: 'Gold',
      });

      try {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'expired@test.com', password: 'password123' });

        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.code, 'ACCOUNT_INACTIVE');
        assert.ok(res.body.message.includes('expired'));
      } finally {
        (prisma.member as any).findUnique = memberFindUnique;
      }
    });

    it('should reject with 403 ACCOUNT_INACTIVE when staff isActive is false', async () => {
      const memberFindUnique = prisma.member.findUnique;
      const staffFindUnique = prisma.staff.findUnique;

      (prisma.member as any).findUnique = async () => null;
      (prisma.staff as any).findUnique = async () => ({
        id: 2,
        email: 'inactive_staff@test.com',
        passwordHash: 'dummy',
        isActive: false,
        role: 'front_desk',
      });

      try {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'inactive_staff@test.com', password: 'password123' });

        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.code, 'ACCOUNT_INACTIVE');
      } finally {
        (prisma.member as any).findUnique = memberFindUnique;
        (prisma.staff as any).findUnique = staffFindUnique;
      }
    });
  });

  describe('AU-02 · POST /api/v1/auth/refresh', () => {
    it('should reject with 401 when refreshToken cookie is missing', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.code, 'INVALID_REFRESH_TOKEN');
    });

    it('should reject with 401 when refreshToken cookie contains garbage', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=garbage_token_value; Path=/api/v1/auth']);

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.code, 'INVALID_REFRESH_TOKEN');
    });
  });

  describe('AU-03 · POST /api/v1/auth/logout', () => {
    it('should reject with 401 if unauthenticated', async () => {
      const res = await request(app).post('/api/v1/auth/logout');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('should succeed with 200 and clear the refreshToken cookie when authenticated', async () => {
      const mockToken = generateAccessToken({
        sub: 1,
        email: 'test@example.com',
        role: 'member',
        tier: 'Gold',
      });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${mockToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);

      // Verify Set-Cookie clears the refresh cookie
      const cookieHeader = res.headers['set-cookie'];
      assert.ok(cookieHeader, 'Set-Cookie header should be present');
      const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader || ''];
      const hasClearedCookie = cookies.some((c: string) =>
        c.includes('refreshToken=;') || c.includes('Max-Age=0')
      );
      assert.ok(hasClearedCookie, 'RefreshToken cookie should be cleared with Max-Age=0');
    });
  });

  describe('AU-04 · GET /api/v1/auth/me', () => {
    it('should reject with 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('should reject with 401 when token is malformed', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('AU-05 / Bug #19 · PATCH /api/v1/auth/profile', () => {
    it('should reject with 401 when unauthenticated', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/profile')
        .send({ fullName: 'Updated Name', phone: '+91 99999 88888' });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('should update staff profile successfully when authenticated as admin', async () => {
      const mockToken = generateAccessToken({
        sub: 1,
        email: 'admin@championsclub.com',
        role: 'admin',
      });

      const staffUpdate = prisma.staff.update;
      (prisma.staff as any).update = async ({ data }: any) => ({
        id: 1,
        email: 'admin@championsclub.com',
        firstName: data.firstName || 'Admin',
        lastName: data.lastName || 'User',
        role: 'admin',
        phone: data.phone || '+91 98765 00000',
        salary: null,
        isActive: true,
      });

      try {
        const res = await request(app)
          .patch('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${mockToken}`)
          .send({ fullName: 'Super Admin', phone: '+91 98765 00000' });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.firstName, 'Super');
        assert.strictEqual(res.body.data.lastName, 'Admin');
        assert.strictEqual(res.body.data.phone, '+91 98765 00000');
      } finally {
        (prisma.staff as any).update = staffUpdate;
      }
    });

    it('should update member profile successfully when authenticated as member', async () => {
      const mockToken = generateAccessToken({
        sub: 101,
        email: 'member@test.com',
        role: 'member',
        tier: 'Gold',
      });

      const memberUpdate = prisma.member.update;
      (prisma.member as any).update = async ({ data }: any) => ({
        id: 101,
        email: 'member@test.com',
        firstName: data.firstName || 'Jane',
        lastName: data.lastName || 'Doe',
        role: 'member',
        tier: 'Gold',
        status: 'active',
        phone: data.phone || '+91 91234 56789',
        membershipStart: new Date(),
        membershipEnd: new Date(),
      });

      try {
        const res = await request(app)
          .patch('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${mockToken}`)
          .send({ fullName: 'Jane Doe', phone: '+91 91234 56789' });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.firstName, 'Jane');
        assert.strictEqual(res.body.data.lastName, 'Doe');
        assert.strictEqual(res.body.data.phone, '+91 91234 56789');
      } finally {
        (prisma.member as any).update = memberUpdate;
      }
    });
  });
});
