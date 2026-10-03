import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  pagination?: PaginationMeta
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined ? { data } : {}),
    ...(pagination !== undefined ? { pagination } : {}),
  };
  return res.status(statusCode).json(payload);
};

export function sendError(
  res: Response,
  message: string,
  statusCode?: number,
  errors?: any,
  code?: string
): Response;
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode?: number,
  details?: any
): Response;
export function sendError(
  res: Response,
  arg1: string,
  arg2?: string | number,
  arg3?: any,
  arg4?: any,
  arg5?: any
): Response {
  let message: string;
  let code: string | undefined;
  let statusCode = 400;
  let errors: any = undefined;

  if (typeof arg2 === 'number' || arg2 === undefined) {
    message = arg1;
    statusCode = arg2 ?? 400;
    errors = arg3;
    code = typeof arg4 === 'string' ? arg4 : typeof arg5 === 'string' ? arg5 : undefined;
  } else {
    code = arg1;
    message = arg2;
    statusCode = typeof arg3 === 'number' ? arg3 : 400;
    errors = arg4;
  }

  const payload: ApiResponse = {
    success: false,
    message,
    ...(code && { code }),
    ...(errors !== undefined && { errors }),
  };
  return res.status(statusCode).json(payload);
}

