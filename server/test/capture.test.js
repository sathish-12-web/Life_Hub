import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Quick Capture Module (/api/capture)', () => {
  const user = {
    name: 'Capture User',
    email: 'capture.tester@example.com',
    password: 'Password123!',
  };

  let token = '';

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: user.email.toLowerCase() },
    });

    const res = await request(app).post('/api/auth/register').send(user);
    token = res.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: user.email.toLowerCase() },
    });
    await prisma.$disconnect();
  });

  describe('Authentication protection', () => {
    it('should reject unauthenticated preview requests with 401', async () => {
      const res = await request(app).post('/api/capture/preview').send({ text: 'Some task' });
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated confirm requests with 401', async () => {
      const res = await request(app)
        .post('/api/capture/confirm')
        .send({ type: 'NOTE', data: { title: 'Test' } });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/capture/preview (Rule-based heuristics)', () => {
    it('should parse expense text with money format as TRANSACTION', async () => {
      const res = await request(app)
        .post('/api/capture/preview')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Spent $42.50 on groceries at supermarket' });

      expect(res.status).toBe(200);
      expect(res.body.data.detectedType).toBe('TRANSACTION');
      expect(res.body.data.data.type).toBe('EXPENSE');
      expect(res.body.data.data.amount).toBe(42.5);
      expect(res.body.data.data.category).toBe('Groceries');
    });

    it('should parse meeting text as EVENT with start/end time', async () => {
      const res = await request(app)
        .post('/api/capture/preview')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Team sync meeting tomorrow at 10am' });

      expect(res.status).toBe(200);
      expect(res.body.data.detectedType).toBe('EVENT');
      expect(res.body.data.data.title).toContain('Team sync meeting');
      expect(res.body.data.data.startAt).toBeDefined();
      expect(res.body.data.data.endAt).toBeDefined();
    });

    it('should parse action verb text with hashtag as TASK', async () => {
      const res = await request(app)
        .post('/api/capture/preview')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Buy printer paper tomorrow #office #urgent' });

      expect(res.status).toBe(200);
      expect(res.body.data.detectedType).toBe('TASK');
      expect(res.body.data.data.title).toContain('Buy printer paper');
      expect(res.body.data.data.tags).toContain('office');
      expect(res.body.data.data.tags).toContain('urgent');
      expect(res.body.data.data.priority).toBe('URGENT');
    });

    it('should fallback general descriptive text to NOTE', async () => {
      const res = await request(app)
        .post('/api/capture/preview')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Remember to check the new database documentation for indexes #reference' });

      expect(res.status).toBe(200);
      expect(res.body.data.detectedType).toBe('NOTE');
      expect(res.body.data.data.title).toBeDefined();
      expect(res.body.data.data.tags).toContain('reference');
    });
  });

  describe('POST /api/capture/confirm (Saving confirmed item)', () => {
    it('should save confirmed TASK and return 201', async () => {
      const res = await request(app)
        .post('/api/capture/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'TASK',
          data: {
            title: 'Capture Confirmed Task',
            priority: 'HIGH',
            tags: ['capture'],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Capture Confirmed Task');
      expect(res.body.meta.type).toBe('TASK');
    });

    it('should save confirmed EVENT and return 201', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const end = new Date(tomorrow);
      end.setHours(end.getHours() + 1);

      const res = await request(app)
        .post('/api/capture/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'EVENT',
          data: {
            title: 'Capture Confirmed Meeting',
            startAt: tomorrow.toISOString(),
            endAt: end.toISOString(),
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Capture Confirmed Meeting');
      expect(res.body.meta.type).toBe('EVENT');
    });

    it('should save confirmed TRANSACTION and return 201', async () => {
      const res = await request(app)
        .post('/api/capture/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'TRANSACTION',
          data: {
            type: 'EXPENSE',
            amount: 85.5,
            category: 'Dining',
            occurredAt: new Date().toISOString(),
          },
        });

      expect(res.status).toBe(201);
      expect(parseFloat(res.body.data.amount)).toBe(85.5);
      expect(res.body.meta.type).toBe('TRANSACTION');
    });

    it('should save confirmed NOTE and return 201', async () => {
      const res = await request(app)
        .post('/api/capture/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'NOTE',
          data: {
            title: 'Capture Confirmed Note',
            body: 'Detailed body of the note',
            tags: ['quick', 'test'],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Capture Confirmed Note');
      expect(res.body.meta.type).toBe('NOTE');
    });
  });
});
