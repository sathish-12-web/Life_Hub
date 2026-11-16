import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { previewCaptureSchema, confirmCaptureSchema } from './capture.schema.js';
import { previewCapture, confirmCapture } from './capture.controller.js';

const router = Router();

// Protect capture endpoints with JWT
router.use(authenticate);

router.post('/preview', validate(previewCaptureSchema), previewCapture);
router.post('/confirm', validate(confirmCaptureSchema), confirmCapture);

export default router;
