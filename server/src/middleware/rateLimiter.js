import rateLimit from 'express-rate-limit';

export const authRateLimiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 15, // Limit each IP to 15 requests per windowMs
      message: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many authentication attempts. Please try again later.',
          details: [],
        },
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
