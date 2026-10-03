import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

/**
 * Middleware factory for request validation using Zod.
 * Validates req.body, req.query, or req.params and attaches sanitized data back to req.
 * If validation fails, ZodError is passed to the next() error handler.
 */
export const validate = (
  schema: ZodTypeAny,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
};
