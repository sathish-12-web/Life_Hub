import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Tasks Module (/api/tasks) & User Isolation', () => {
  const userA = {
    name: 'User Alpha',
    email: 'alpha.task@example.com',
    password: 'Password123!',
  };

  const userB = {
    name: 'User Beta',
    email: 'beta.task@example.com',
    password: 'Password123!',
  };

  let tokenA = '';
  let tokenB = '';
  let userATaskId = '';

  beforeAll(async () => {
    // Clean up test users & their tasks
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email.toLowerCase(), userB.email.toLowerCase()] } },
    });

    // Register User A
    const resA = await request(app).post('/api/auth/register').send(userA);
    tokenA = resA.body.data.accessToken;

    // Register User B
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
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Tasks CRUD for User A', () => {
    it('should create a task successfully with 201 status', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Complete Sprint 3 tasks',
          description: 'Build CRUD and verify user isolation',
          priority: 'HIGH',
          status: 'TODO',
          tags: ['sprint3', 'lifehub'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe('Complete Sprint 3 tasks');
      expect(res.body.data.priority).toBe('HIGH');
      expect(res.body.data.status).toBe('TODO');
      expect(res.body.data.tags).toEqual(['sprint3', 'lifehub']);

      userATaskId = res.body.data.id;
    });

    it('should list tasks with pagination metadata', async () => {
      // Create a second task
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Second task for User A', priority: 'LOW' });

      const res = await request(app)
        .get('/api/tasks?page=1&limit=20')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should retrieve a single task by ID', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userATaskId);
      expect(res.body.data.title).toBe('Complete Sprint 3 tasks');
    });

    it('should update task status and title with PATCH', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          status: 'DONE',
          title: 'Complete Sprint 3 tasks (Updated)',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('DONE');
      expect(res.body.data.title).toBe('Complete Sprint 3 tasks (Updated)');
    });

    it('should retrieve task statistics for dashboard', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.done).toBe(1);
      expect(res.body.data.todo).toBe(1);
    });
  });

  describe('Strict User Isolation & Authorization (User B vs User A)', () => {
    it('User B cannot see User A tasks in their list', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it('User B cannot GET User A task (MUST return 404 Not Found to prevent ID leakage)', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User B cannot PATCH User A task (MUST return 404 Not Found)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Malicious title hijack' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      // Verify task in DB was NOT modified
      const checkRes = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.body.data.title).toBe('Complete Sprint 3 tasks (Updated)');
    });

    it('User B cannot DELETE User A task (MUST return 404 Not Found)', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      // Verify task still exists
      const checkRes = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(200);
    });
  });

  describe('Task Deletion by Owner', () => {
    it('User A can delete their own task with 204 No Content', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(204);

      // Subsequent fetch returns 404
      const checkRes = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
