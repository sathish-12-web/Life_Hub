import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  transactionSummaryQuerySchema,
  transactionIdParamSchema,
} from './transactions.schema.js';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from './transactions.controller.js';

const router = Router();

// Protect all transactions endpoints with JWT
router.use(authenticate);

router.post('/', validate(createTransactionSchema), createTransaction);
router.get('/', validate(transactionQuerySchema), getTransactions);
router.get('/summary', validate(transactionSummaryQuerySchema), getTransactionSummary);
router.get('/:id', validate(transactionIdParamSchema), getTransactionById);
router.patch('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', validate(transactionIdParamSchema), deleteTransaction);

export default router;
