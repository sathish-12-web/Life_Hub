import { z } from 'zod';

export const createEventSchema = {
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(255),
    description: z.string().trim().max(4000).optional().nullable(),
    startAt: z.string().datetime({ message: 'Valid startAt datetime is required' }),
    endAt: z.string().datetime({ message: 'Valid endAt datetime is required' }),
    reminderAt: z.string().datetime().optional().nullable(),
    recurrenceRule: z.string().trim().max(100).optional().nullable(),
  }).refine((data) => new Date(data.endAt) >= new Date(data.startAt), {
    message: 'endAt must be greater than or equal to startAt',
    path: ['endAt'],
  }),
};

export const updateEventSchema = {
  params: z.object({
    id: z.string().uuid('Invalid event ID'),
  }),
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
    description: z.string().trim().max(4000).optional().nullable(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    reminderAt: z.string().datetime().optional().nullable(),
    recurrenceRule: z.string().trim().max(100).optional().nullable(),
  }).refine((data) => {
    if (data.startAt && data.endAt) {
      return new Date(data.endAt) >= new Date(data.startAt);
    }
    return true;
  }, {
    message: 'endAt must be greater than or equal to startAt',
    path: ['endAt'],
  }),
};

export const eventQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),
};

export const eventIdParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid event ID'),
  }),
};
