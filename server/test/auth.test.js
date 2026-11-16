import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Auth Module (/api/auth)', () => {
  const testUser = {
    name: 'Alice Developer',
    email: 'alice.test@example.com',
    password: 'Password123!',
  };

  let accessToken = '';
  let refreshTokenCookie = '';

  beforeAll(async () => {
    // Clean up test user before tests run
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email.toLowerCase(), 'bob.test@example.com'] } },
    });
  });

  afterAll(async () => {
    // Clean up test user after tests complete
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email.toLowerCase(), 'bob.test@example.com'] } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with 201 status', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.user.id).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();

      // Rule: Never return passwordHash
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.password_hash).toBeUndefined();

      // Verify httpOnly cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const hasRefreshCookie = cookies.some((c) => c.includes('refreshToken=') && c.includes('HttpOnly'));
      expect(hasRefreshCookie).toBe(true);

      accessToken = res.body.data.accessToken;
      refreshTokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject validation failures with 400 and detailed errors', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A', // too short
          email: 'not-an-email',
          password: 'short', // too short (<8)
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.details)).toBe(true);
      expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in existing user with 200 status and valid token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies.some((c) => c.includes('refreshToken=') && c.includes('HttpOnly'))).toBe(true);
    });

    it('should reject incorrect password with 401 and generic message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should reject unknown email with 401 and generic message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated user profile when token is valid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject request with 401 when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with 401 when token is invalid or forged', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/refresh & /api/auth/logout', () => {
    it('should refresh tokens when valid refreshToken cookie is sent', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [refreshTokenCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it('should log out and clear the refresh token cookie', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [refreshTokenCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Logged out successfully');

      const cookies = res.headers['set-cookie'];
      expect(cookies.some((c) => c.includes('refreshToken=;') || c.includes('Max-Age=0'))).toBe(true);
    });
  });
});
