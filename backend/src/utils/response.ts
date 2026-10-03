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
<<<<<<< HEAD
    messageOrCode: string,
      statusOrMessage ?: number | string,
      errorsOrStatusCode ?: any,
      codeOrErrors ?: string | any
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

=======
  }

  const payload: ApiResponse = {
    success: false,
    message,
    ...(code && { code }),
    ...(errors !== undefined && { errors }),
  };
  return res.status(statusCode).json(payload);
}
>>>>>>> dd3b269109ff0d20f16be7ce794013239fab26de
