import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Notes Module (/api/notes) & User Isolation', () => {
  const userA = {
    name: 'User Notes Alpha',
    email: 'notes.alpha@example.com',
    password: 'Password123!',
  };

  const userB = {
    name: 'User Notes Beta',
    email: 'notes.beta@example.com',
    password: 'Password123!',
  };

  let tokenA = '';
  let tokenB = '';
  let userANoteId = '';

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
      const res = await request(app).get('/api/notes');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Notes CRUD for User A', () => {
    it('should reject note creation with empty title with 400', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: '   ',
          body: 'Some body content',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create a note successfully with 201 status', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'System Architecture Ideas',
          body: 'Explore event-driven patterns with PostgreSQL and Redis.',
          tags: ['architecture', 'ideas'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe('System Architecture Ideas');
      expect(res.body.data.tags).toContain('architecture');
      expect(res.body.data.archivedAt).toBeNull();

      userANoteId = res.body.data.id;
    });

    it('should create a second note for search and archive tests', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Weekly Book Reading',
          body: 'Reading Clean Code chapters 1 through 3.',
          tags: ['books', 'personal'],
        });

      expect(res.status).toBe(201);
    });

    it('should list unarchived notes with pagination', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(2);
    });

    it('should search notes by query string q across title and body', async () => {
      const res = await request(app)
        .get('/api/notes?q=architecture')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('System Architecture Ideas');
    });

    it('should filter notes by tag', async () => {
      const res = await request(app)
        .get('/api/notes?tag=books')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Weekly Book Reading');
    });

    it('should retrieve a single note by ID', async () => {
      const res = await request(app)
        .get(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userANoteId);
      expect(res.body.data.title).toBe('System Architecture Ideas');
    });

    it('should update a note with PATCH', async () => {
      const res = await request(app)
        .patch(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'System Architecture Ideas (Draft 2)',
          tags: ['architecture', 'ideas', 'v2'],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('System Architecture Ideas (Draft 2)');
      expect(res.body.data.tags).toContain('v2');
    });

    it('should archive a note using isArchived: true', async () => {
      const res = await request(app)
        .patch(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ isArchived: true });

      expect(res.status).toBe(200);
      expect(res.body.data.archivedAt).not.toBeNull();

      // Check that unarchived list now only has 1 note
      const listRes = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(listRes.body.data.length).toBe(1);

      // Check that archived query returns the archived note
      const archRes = await request(app)
        .get('/api/notes?archived=true')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(archRes.body.data.length).toBe(1);
      expect(archRes.body.data[0].id).toBe(userANoteId);

      // Restore it back for subsequent tests
      await request(app)
        .patch(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ isArchived: false });
    });
  });

  describe('Strict User Isolation & Authorization (User B vs User A)', () => {
    it('User B cannot see User A notes in list or search', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);

      const searchRes = await request(app)
        .get('/api/notes?q=architecture')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(searchRes.body.data).toEqual([]);
    });

    it('User B cannot GET User A note (MUST return 404 Not Found to prevent ID leakage)', async () => {
      const res = await request(app)
        .get(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User B cannot PATCH User A note (MUST return 404 Not Found)', async () => {
      const res = await request(app)
        .patch(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hijacked Title' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User B cannot DELETE User A note (MUST return 404 Not Found)', async () => {
      const res = await request(app)
        .delete(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Note Deletion by Owner', () => {
    it('User A can delete their note with 204 No Content', async () => {
      const res = await request(app)
        .delete(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(204);

      const checkRes = await request(app)
        .get(`/api/notes/${userANoteId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
