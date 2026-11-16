import { AppError } from './errorHandler.js';

export function validate(schema) {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        const parsed = await schema.query.parseAsync(req.query);
        for (const key of Object.keys(req.query)) {
          delete req.query[key];
        }
        Object.assign(req.query, parsed);
      }
      if (schema.params) {
        const parsed = await schema.params.parseAsync(req.params);
        Object.assign(req.params, parsed);
      }
      next();
    } catch (error) {
      if (error.issues) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
      }
      next(error);
    }
  };
}
