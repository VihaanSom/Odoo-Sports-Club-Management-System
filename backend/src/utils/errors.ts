export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode = 400, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function parseMessageAndCode(
  arg1?: string,
  arg2?: string,
  defaultMessage = 'Error',
  defaultCode?: string
): { message: string; code?: string } {
  if (!arg1 && !arg2) {
    return { message: defaultMessage, code: defaultCode };
  }
  if (arg1 && !arg2) {
    if (/^[A-Z0-9_]+$/.test(arg1)) {
      return { message: defaultMessage, code: arg1 };
    }
    return { message: arg1, code: defaultCode };
  }

  const isArg1Code = /^[A-Z0-9_]+$/.test(arg1!);
  const isArg2Code = /^[A-Z0-9_]+$/.test(arg2!);

  if (isArg1Code && !isArg2Code) {
    // Called as: (code, message)
    return { code: arg1, message: arg2! };
  } else if (!isArg1Code && isArg2Code) {
    // Called as: (message, code)
    return { message: arg1!, code: arg2 };
  } else {
    // Default: (message, code)
    return { message: arg1!, code: arg2 };
  }
}

export class ValidationError extends AppError {
  constructor(arg1?: string, arg2?: string) {
    const { message, code } = parseMessageAndCode(arg1, arg2, 'Validation failed', 'VALIDATION_ERROR');
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(arg1?: string, arg2?: string) {
    const { message, code } = parseMessageAndCode(arg1, arg2, 'Unauthorized', 'UNAUTHENTICATED');
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(arg1?: string, arg2?: string) {
    const { message, code } = parseMessageAndCode(arg1, arg2, 'Forbidden', 'FORBIDDEN');
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(arg1?: string, arg2?: string) {
    const { message, code } = parseMessageAndCode(arg1, arg2, 'Resource not found', 'NOT_FOUND');
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(arg1?: string, arg2?: string) {
    const { message, code } = parseMessageAndCode(arg1, arg2, 'Resource conflict', 'CONFLICT');
    super(message, 409, code);
  }
}

export class UnprocessableError extends AppError {
  constructor(arg1?: string, arg2?: string) {
    const { message, code } = parseMessageAndCode(arg1, arg2, 'Unprocessable entity', 'UNPROCESSABLE_ENTITY');
    super(message, 422, code);
  }
}
