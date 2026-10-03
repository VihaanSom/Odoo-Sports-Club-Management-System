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
  messageOrCode: string,
  statusOrMessage?: number | string,
  errorsOrStatusCode?: any,
  codeOrErrors?: string | any
): Response {
  let message: string;
  let statusCode = 400;
  let code: string | undefined;
  let errors: any;

  if (typeof statusOrMessage === 'number') {
    // Called as: sendError(res, message, statusCode, errors, code)
    message = messageOrCode;
    statusCode = statusOrMessage;
    errors = errorsOrStatusCode;
    code = typeof codeOrErrors === 'string' ? codeOrErrors : undefined;
  } else if (typeof statusOrMessage === 'string') {
    // Called as: sendError(res, code, message, statusCode, errors)
    code = messageOrCode;
    message = statusOrMessage;
    statusCode = typeof errorsOrStatusCode === 'number' ? errorsOrStatusCode : 400;
    errors = codeOrErrors;
  } else {
    message = messageOrCode;
  }

  const payload: ApiResponse = {
    success: false,
    message,
    ...(code && { code }),
    ...(errors !== undefined && { errors }),
  };
  return res.status(statusCode).json(payload);
}
