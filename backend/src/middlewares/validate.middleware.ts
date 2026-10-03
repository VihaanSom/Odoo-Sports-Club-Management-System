import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

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
