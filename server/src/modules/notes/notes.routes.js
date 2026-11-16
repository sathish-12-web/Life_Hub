import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
  noteIdParamSchema,
} from './notes.schema.js';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from './notes.controller.js';

const router = Router();

// Protect all notes endpoints with JWT
router.use(authenticate);

router.post('/', validate(createNoteSchema), createNote);
router.get('/', validate(noteQuerySchema), getNotes);
router.get('/:id', validate(noteIdParamSchema), getNoteById);
router.patch('/:id', validate(updateNoteSchema), updateNote);
router.delete('/:id', validate(noteIdParamSchema), deleteNote);

export default router;
