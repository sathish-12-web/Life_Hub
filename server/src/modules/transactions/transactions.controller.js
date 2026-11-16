import * as transactionsService from './transactions.service.js';

export async function createTransaction(req, res, next) {
  try {
    const transaction = await transactionsService.createTransaction(req.user.id, req.body);

    res.status(201).json({
      data: transaction,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransactions(req, res, next) {
  try {
    const { transactions, meta } = await transactionsService.getTransactions(req.user.id, req.query);

    res.status(200).json({
      data: transactions,
      meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(req, res, next) {
  try {
    const transaction = await transactionsService.getTransactionById(req.user.id, req.params.id);

    res.status(200).json({
      data: transaction,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(req, res, next) {
  try {
    const transaction = await transactionsService.updateTransaction(req.user.id, req.params.id, req.body);

    res.status(200).json({
      data: transaction,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(req, res, next) {
  try {
    await transactionsService.deleteTransaction(req.user.id, req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getTransactionSummary(req, res, next) {
  try {
    const summary = await transactionsService.getTransactionSummary(req.user.id, req.query.month);

    res.status(200).json({
      data: summary,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}
