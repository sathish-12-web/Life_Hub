import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || [];

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.url} - ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
}
