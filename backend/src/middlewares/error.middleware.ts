import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error caught by global handler:', err);

  // Handle Domain AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details, err.code);
    return;
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError || err.name === 'ZodError') {
    const rawIssues: any[] = (err as any).issues || (err as any).errors || [];
    const formattedErrors = rawIssues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
      message: e.message,
    }));
    sendError(res, 'Validation failed', 400, formattedErrors, 'VALIDATION_ERROR');
    return;
  }

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['Field'];
      sendError(res, `Unique constraint violation on: ${target.join(', ')}`, 409, undefined, 'CONFLICT');
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Record not found', 404, undefined, 'NOT_FOUND');
      return;
    }
    if (err.code === 'P2003') {
      sendError(res, 'Foreign key constraint violation', 400, undefined, 'FOREIGN_KEY_VIOLATION');
      return;
    }
  }

  // Handle General Errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  sendError(
    res,
    message,
    statusCode,
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined,
    'INTERNAL_SERVER_ERROR'
  );
};
