import { z } from 'zod';

export const createTransactionSchema = {
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    currency: z.string().trim().max(10).default('USD'),
    category: z.string().trim().min(1, 'Category is required').max(100),
    occurredAt: z.string().datetime().optional(),
    note: z.string().trim().max(2000).optional().nullable(),
  }),
};

export const updateTransactionSchema = {
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    amount: z.coerce.number().positive('Amount must be greater than 0').optional(),
    currency: z.string().trim().max(10).optional(),
    category: z.string().trim().min(1, 'Category cannot be empty').max(100).optional(),
    occurredAt: z.string().datetime().optional(),
    note: z.string().trim().max(2000).optional().nullable(),
  }),
};

export const transactionQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().trim().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    sort: z.enum(['occurredAt', 'amount', 'createdAt']).default('occurredAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
};

export const transactionSummaryQuerySchema = {
  query: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
  }),
};

export const transactionIdParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
};
