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

export class UnauthorizedError extends AppError {
  constructor(arg1 = 'Unauthorized', arg2 = 'UNAUTHENTICATED') {
    const isCodeFirst = arg1 === arg1.toUpperCase() && (arg1.includes('_') || arg1 === 'UNAUTHENTICATED');
    const code = isCodeFirst ? arg1 : arg2;
    const message = isCodeFirst ? arg2 : arg1;
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(arg1 = 'Forbidden', arg2 = 'FORBIDDEN') {
    const isCodeFirst = arg1 === arg1.toUpperCase() && (arg1.includes('_') || arg1 === 'FORBIDDEN');
    const code = isCodeFirst ? arg1 : arg2;
    const message = isCodeFirst ? arg2 : arg1;
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(arg1 = 'Resource not found', arg2 = 'NOT_FOUND') {
    const isCodeFirst = arg1 === arg1.toUpperCase() && (arg1.includes('_') || arg1 === 'NOT_FOUND');
    const code = isCodeFirst ? arg1 : arg2;
    const message = isCodeFirst ? arg2 : arg1;
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(arg1 = 'Conflict', arg2 = 'CONFLICT') {
    const isCodeFirst = arg1 === arg1.toUpperCase() && (arg1.includes('_') || arg1 === 'CONFLICT');
    const code = isCodeFirst ? arg1 : arg2;
    const message = isCodeFirst ? arg2 : arg1;
    super(message, 409, code);
  }
}

export class UnprocessableError extends AppError {
  constructor(arg1 = 'Unprocessable entity', arg2 = 'UNPROCESSABLE_ENTITY') {
    const isCodeFirst = arg1 === arg1.toUpperCase() && (arg1.includes('_') || arg1 === 'UNPROCESSABLE_ENTITY');
    const code = isCodeFirst ? arg1 : arg2;
    const message = isCodeFirst ? arg2 : arg1;
    super(message, 422, code);
  }
}

export class ValidationError extends AppError {
  constructor(arg1 = 'Validation failed', arg2 = 'VALIDATION_ERROR') {
    const isCodeFirst = arg1 === arg1.toUpperCase() && (arg1.includes('_') || arg1 === 'VALIDATION_ERROR');
    const code = isCodeFirst ? arg1 : arg2;
    const message = isCodeFirst ? arg2 : arg1;
    super(message, 400, code);
  }
}

