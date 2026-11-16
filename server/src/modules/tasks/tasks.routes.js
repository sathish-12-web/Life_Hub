import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskIdParamSchema,
} from './tasks.schema.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} from './tasks.controller.js';

const router = Router();

// Protect all tasks routes with JWT authentication
router.use(authenticate);

router.post('/', validate(createTaskSchema), createTask);
router.get('/', validate(taskQuerySchema), getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', validate(taskIdParamSchema), getTaskById);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(taskIdParamSchema), deleteTask);

export default router;
