import { z } from 'zod';

export const previewCaptureSchema = {
  body: z.object({
    text: z.string().trim().min(1, 'Text cannot be empty').max(2000),
  }),
};

export const confirmCaptureSchema = {
  body: z.object({
    type: z.enum(['TASK', 'EVENT', 'TRANSACTION', 'NOTE']),
    data: z.record(z.any()),
  }),
};
