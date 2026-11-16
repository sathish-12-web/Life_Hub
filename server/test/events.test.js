import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Events Module (/api/events) & User Isolation', () => {
  const userA = {
    name: 'User Calendar Alpha',
    email: 'cal.alpha@example.com',
    password: 'Password123!',
  };

  const userB = {
    name: 'User Calendar Beta',
    email: 'cal.beta@example.com',
    password: 'Password123!',
  };

  let tokenA = '';
  let tokenB = '';
  let userAEventId = '';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startAt = tomorrow.toISOString();

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(tomorrowEnd.getHours() + 1);
  const endAt = tomorrowEnd.toISOString();

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email.toLowerCase(), userB.email.toLowerCase()] } },
    });

    const resA = await request(app).post('/api/auth/register').send(userA);
    tokenA = resA.body.data.accessToken;

    const resB = await request(app).post('/api/auth/register').send(userB);
    tokenB = resB.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email.toLowerCase(), userB.email.toLowerCase()] } },
    });
    await prisma.$disconnect();
  });

  describe('Authentication protection', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Events CRUD for User A', () => {
    it('should create an event successfully with 201 status', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Sprint Planning Meeting',
          description: 'Review roadmap and deliverables',
          startAt,
          endAt,
          recurrenceRule: 'WEEKLY',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe('Sprint Planning Meeting');
      expect(res.body.data.recurrenceRule).toBe('WEEKLY');
      expect(res.body.data.id).toBeDefined();

      userAEventId = res.body.data.id;
    });

    it('should reject invalid dates where endAt is before startAt with 400', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Invalid Time Event',
          startAt: endAt,
          endAt: startAt, // invalid: end before start
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should list events with date filtering and pagination', async () => {
      const res = await request(app)
        .get(`/api/events?from=${new Date().toISOString()}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta).toBeDefined();
    });

    it('should retrieve a single event by ID', async () => {
      const res = await request(app)
        .get(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userAEventId);
      expect(res.body.data.title).toBe('Sprint Planning Meeting');
    });

    it('should update an event with PATCH', async () => {
      const res = await request(app)
        .patch(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Sprint Planning Meeting (Extended)',
          description: 'Updated meeting notes and agenda',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Sprint Planning Meeting (Extended)');
    });
  });

  describe('Strict User Isolation & Authorization (User B vs User A)', () => {
    it('User B cannot see User A events in their list', async () => {
      const res = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it('User B cannot GET User A event (MUST return 404 Not Found to prevent ID leakage)', async () => {
      const res = await request(app)
        .get(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User B cannot PATCH User A event (MUST return 404 Not Found)', async () => {
      const res = await request(app)
        .patch(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hijacked Event Title' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      const checkRes = await request(app)
        .get(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.body.data.title).toBe('Sprint Planning Meeting (Extended)');
    });

    it('User B cannot DELETE User A event (MUST return 404 Not Found)', async () => {
      const res = await request(app)
        .delete(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      const checkRes = await request(app)
        .get(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(200);
    });
  });

  describe('Event Deletion by Owner', () => {
    it('User A can delete their own event with 204 No Content', async () => {
      const res = await request(app)
        .delete(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(204);

      const checkRes = await request(app)
        .get(`/api/events/${userAEventId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
