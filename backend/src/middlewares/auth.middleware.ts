import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { AuthUser } from '../types';

export interface DecodedJwtToken {
  sub: number;
  email: string;
  role: string;
  tier?: string | null;
  iat?: number;
  exp?: number;
}

export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header', 'UNAUTHENTICATED');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as DecodedJwtToken;
    req.user = {
      id: decoded.sub,
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      tier: decoded.tier as any,
      type: decoded.role === 'member' ? 'member' : 'staff',
    };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token has expired', 'UNAUTHENTICATED');
    }
    throw new UnauthorizedError('Invalid access token', 'UNAUTHENTICATED');
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found', 'UNAUTHENTICATED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
        'FORBIDDEN'
      );
    }

    next();
  };
};

export const requireSelfOrRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found', 'UNAUTHENTICATED');
    }

    // Check if user has an elevated staff role
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Check if the user is a member acting on their own ID
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetId = parseInt(rawId, 10);
    if (req.user.role === 'member' && req.user.id === targetId) {
      return next();
    }

    throw new ForbiddenError(
      'Access denied. You can only view or modify your own profile.',
      'FORBIDDEN'
    );
  };
};
