import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Transactions Module (/api/transactions) & Financial Reports', () => {
  const userA = {
    name: 'User Finance Alpha',
    email: 'finance.alpha@example.com',
    password: 'Password123!',
  };

  const userB = {
    name: 'User Finance Beta',
    email: 'finance.beta@example.com',
    password: 'Password123!',
  };

  let tokenA = '';
  let tokenB = '';
  let incomeTxId = '';
  let expenseTxId = '';

  const now = new Date();
  const currentMonthStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const midMonthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 15, 12, 0, 0)).toISOString();

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
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Validation', () => {
    it('should reject transaction with amount <= 0 with 400', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'EXPENSE',
          amount: -50,
          category: 'Shopping',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid transaction type with 400', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'INVALID_TYPE',
          amount: 50,
          category: 'Shopping',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Transactions CRUD for User A', () => {
    it('should create an INCOME transaction with 201 status', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'INCOME',
          amount: 3000.5,
          category: 'Salary',
          currency: 'USD',
          occurredAt: midMonthDate,
          note: 'November paycheck',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.type).toBe('INCOME');
      expect(parseFloat(res.body.data.amount)).toBe(3000.5);
      expect(res.body.data.category).toBe('Salary');

      incomeTxId = res.body.data.id;
    });

    it('should create EXPENSE transactions with 201 status', async () => {
      const res1 = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'EXPENSE',
          amount: 120.25,
          category: 'Groceries',
          occurredAt: midMonthDate,
          note: 'Supermarket restock',
        });

      expect(res1.status).toBe(201);
      expenseTxId = res1.body.data.id;

      const res2 = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'EXPENSE',
          amount: 45.75,
          category: 'Dining',
          occurredAt: midMonthDate,
          note: 'Dinner with friends',
        });

      expect(res2.status).toBe(201);
    });

    it('should list transactions with filters and pagination', async () => {
      const res = await request(app)
        .get('/api/transactions?type=EXPENSE')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(2);
    });

    it('should retrieve a single transaction by ID', async () => {
      const res = await request(app)
        .get(`/api/transactions/${incomeTxId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(incomeTxId);
      expect(res.body.data.category).toBe('Salary');
    });

    it('should update a transaction with PATCH', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${expenseTxId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          amount: 130.0,
          note: 'Supermarket restock + snacks',
        });

      expect(res.status).toBe(200);
      expect(parseFloat(res.body.data.amount)).toBe(130.0);
      expect(res.body.data.note).toBe('Supermarket restock + snacks');
    });
  });

  describe('Database SQL Aggregated Monthly Summary (Rule #7)', () => {
    it('should calculate accurate monthly totals and category breakdown via database aggregation', async () => {
      const res = await request(app)
        .get(`/api/transactions/summary?month=${currentMonthStr}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      const summary = res.body.data;
      expect(summary.month).toBe(currentMonthStr);
      // Income = 3000.50
      expect(summary.totalIncome).toBe(3000.5);
      // Expenses = 130.00 (updated) + 45.75 = 175.75
      expect(summary.totalExpense).toBe(175.75);
      // Net = 3000.50 - 175.75 = 2824.75
      expect(summary.netBalance).toBe(2824.75);

      // Verify category breakdown
      expect(Array.isArray(summary.categoryBreakdown)).toBe(true);
      const groceryCat = summary.categoryBreakdown.find((c) => c.category === 'Groceries');
      expect(groceryCat).toBeDefined();
      expect(groceryCat.total).toBe(130.0);
      expect(groceryCat.count).toBe(1);

      const diningCat = summary.categoryBreakdown.find((c) => c.category === 'Dining');
      expect(diningCat).toBeDefined();
      expect(diningCat.total).toBe(45.75);
    });
  });

  describe('Strict User Isolation & Authorization (User B vs User A)', () => {
    it('User B cannot see User A transactions in list', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it('User B financial summary excludes User A transactions completely', async () => {
      const res = await request(app)
        .get(`/api/transactions/summary?month=${currentMonthStr}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalIncome).toBe(0);
      expect(res.body.data.totalExpense).toBe(0);
      expect(res.body.data.netBalance).toBe(0);
      expect(res.body.data.categoryBreakdown).toEqual([]);
    });

    it('User B cannot GET User A transaction (MUST return 404 Not Found to prevent ID leakage)', async () => {
      const res = await request(app)
        .get(`/api/transactions/${incomeTxId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User B cannot PATCH User A transaction (MUST return 404 Not Found)', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${incomeTxId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ amount: 99999 });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      const checkRes = await request(app)
        .get(`/api/transactions/${incomeTxId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(parseFloat(checkRes.body.data.amount)).toBe(3000.5);
    });

    it('User B cannot DELETE User A transaction (MUST return 404 Not Found)', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${incomeTxId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      const checkRes = await request(app)
        .get(`/api/transactions/${incomeTxId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(200);
    });
  });

  describe('Transaction Deletion by Owner', () => {
    it('User A can delete their own transaction with 204 No Content', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${incomeTxId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(204);

      const checkRes = await request(app)
        .get(`/api/transactions/${incomeTxId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
