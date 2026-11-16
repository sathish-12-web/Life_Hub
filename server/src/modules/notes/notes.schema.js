import { z } from 'zod';

export const createNoteSchema = {
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(255),
    body: z.string().default(''),
    tags: z.array(z.string().trim().max(50)).default([]),
  }),
};

export const updateNoteSchema = {
  params: z.object({
    id: z.string().uuid('Invalid note ID'),
  }),
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
    body: z.string().optional(),
    tags: z.array(z.string().trim().max(50)).optional(),
    isArchived: z.boolean().optional(),
    archivedAt: z.string().datetime().optional().nullable(),
  }),
};

export const noteQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional(),
    tag: z.string().trim().optional(),
    archived: z
      .enum(['true', 'false', 'all'])
      .optional()
      .default('false'),
    sort: z.enum(['updatedAt', 'createdAt', 'title']).default('updatedAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
};

export const noteIdParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid note ID'),
  }),
};
