import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Known AppError
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const fieldPath = issue.path.join('.');
      fields[fieldPath || 'root'] = issue.message;
    }
    sendError(
      res,
      'VALIDATION_ERROR',
      'Invalid input. Check the details.',
      400,
      { fields }
    );
    return;
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta?.target.join(', ') : 'field';
      sendError(
        res,
        'DUPLICATE_ENTRY',
        `Unique constraint violation on: ${target}`,
        409
      );
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'NOT_FOUND', 'The requested record was not found', 404);
      return;
    }
  }

  // 4. JSON body parsing error
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    sendError(res, 'VALIDATION_ERROR', 'Malformed JSON in request body', 400);
    return;
  }

  // 5. Unhandled unexpected errors
  console.error('Unhandled server error:', err);
  sendError(
    res,
    'INTERNAL_ERROR',
    'An unexpected internal server error occurred',
    500
  );
};
