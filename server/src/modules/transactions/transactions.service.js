import { Prisma } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createTransaction(ownerId, data) {
  const occurredAt = data.occurredAt ? new Date(data.occurredAt) : new Date();

  const transaction = await prisma.transaction.create({
    data: {
      ownerId,
      type: data.type,
      amount: new Prisma.Decimal(data.amount),
      currency: data.currency || 'USD',
      category: data.category,
      occurredAt,
      note: data.note || null,
    },
  });

  return transaction;
}

export async function getTransactions(
  ownerId,
  { page = 1, limit = 20, type, category, from, to, sort = 'occurredAt', order = 'desc' }
) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

  const where = {
    ownerId,
  };

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = {
      contains: category,
      mode: 'insensitive',
    };
  }

  if (from || to) {
    where.occurredAt = {};
    if (from) where.occurredAt.gte = new Date(from);
    if (to) where.occurredAt.lte = new Date(to);
  }

  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sort]: order,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

export async function getTransactionById(ownerId, transactionId) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      ownerId,
    },
  });

  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'NOT_FOUND');
  }

  return transaction;
}

export async function updateTransaction(ownerId, transactionId, data) {
  const existing = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      ownerId,
    },
  });

  if (!existing) {
    throw new AppError('Transaction not found', 404, 'NOT_FOUND');
  }

  const updateData = {};
  if (data.type !== undefined) updateData.type = data.type;
  if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.occurredAt !== undefined) updateData.occurredAt = new Date(data.occurredAt);
  if (data.note !== undefined) updateData.note = data.note;

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
  });

  return updated;
}

export async function deleteTransaction(ownerId, transactionId) {
  const existing = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      ownerId,
    },
  });

  if (!existing) {
    throw new AppError('Transaction not found', 404, 'NOT_FOUND');
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  return true;
}

export async function getTransactionSummary(ownerId, monthString) {
  let startDate;
  let endDate;
  let targetMonth;

  if (monthString) {
    const [year, month] = monthString.split('-').map(Number);
    startDate = new Date(Date.UTC(year, month - 1, 1));
    endDate = new Date(Date.UTC(year, month, 1));
    targetMonth = monthString;
  } else {
    const now = new Date();
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    targetMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  // Database SQL Aggregates (Rule #7)
  const totals = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0)::numeric AS "totalIncome",
      COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0)::numeric AS "totalExpense"
    FROM transactions
    WHERE owner_id = ${ownerId}::uuid
      AND occurred_at >= ${startDate}
      AND occurred_at < ${endDate}
  `;

  const categoryBreakdown = await prisma.$queryRaw`
    SELECT
      category,
      type::text,
      COALESCE(SUM(amount), 0)::numeric AS total,
      COUNT(*)::int AS count
    FROM transactions
    WHERE owner_id = ${ownerId}::uuid
      AND occurred_at >= ${startDate}
      AND occurred_at < ${endDate}
    GROUP BY category, type
    ORDER BY total DESC
  `;

  const totalIncome = parseFloat(totals[0]?.totalIncome ?? 0);
  const totalExpense = parseFloat(totals[0]?.totalExpense ?? 0);
  const netBalance = parseFloat((totalIncome - totalExpense).toFixed(2));

  const categories = categoryBreakdown.map((row) => ({
    category: row.category,
    type: row.type,
    total: parseFloat(row.total ?? 0),
    count: Number(row.count ?? 0),
  }));

  return {
    month: targetMonth,
    totalIncome,
    totalExpense,
    netBalance,
    categoryBreakdown: categories,
  };
}
