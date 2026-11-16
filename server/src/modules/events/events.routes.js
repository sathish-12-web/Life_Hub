import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  eventIdParamSchema,
} from './events.schema.js';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from './events.controller.js';

const router = Router();

// Protect all events endpoints with JWT
router.use(authenticate);

router.post('/', validate(createEventSchema), createEvent);
router.get('/', validate(eventQuerySchema), getEvents);
router.get('/:id', validate(eventIdParamSchema), getEventById);
router.patch('/:id', validate(updateEventSchema), updateEvent);
router.delete('/:id', validate(eventIdParamSchema), deleteEvent);

export default router;
