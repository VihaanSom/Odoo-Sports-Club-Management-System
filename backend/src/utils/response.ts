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

export const sendError = (
  res: Response,
  codeOrMessage: string,
  messageOrStatus?: string | number,
  statusCode = 400,
  details?: any
): Response => {
  let code = 'ERROR';
  let message = codeOrMessage;
  let status = statusCode;
  let errorDetails = details;

  if (typeof messageOrStatus === 'string') {
    code = codeOrMessage;
    message = messageOrStatus;
    status = statusCode;
  } else if (typeof messageOrStatus === 'number') {
    message = codeOrMessage;
    status = messageOrStatus;
    errorDetails = statusCode as any;
  }

  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(errorDetails !== undefined ? { details: errorDetails } : {}),
    },
  };
  return res.status(status).json(payload);
};
