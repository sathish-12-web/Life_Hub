import { z } from 'zod';

export const createTaskSchema = {
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(255),
    description: z.string().trim().max(4000).optional().nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional().default('TODO'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
    dueAt: z.string().datetime().optional().nullable(),
    tags: z.array(z.string().trim().min(1)).optional().default([]),
  }),
};

export const updateTaskSchema = {
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
    description: z.string().trim().max(4000).optional().nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueAt: z.string().datetime().optional().nullable(),
    tags: z.array(z.string().trim().min(1)).optional(),
  }),
};

export const taskQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    sort: z.enum(['dueAt', 'createdAt', 'priority', 'title']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
};

export const taskIdParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
};
