import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { sendError } from '../utils/response';
import { UserRole } from '../types';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required: missing or invalid Bearer token', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      tier: decoded.tier,
    };
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired access token', 401);
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, `Access forbidden: requires one of [${roles.join(', ')}]`, 403);
      return;
    }
    next();
  };
};

export const requireStaff = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role === 'member') {
    sendError(res, 'Access forbidden: staff role required', 403);
    return;
  }
  next();
};

export const requireMember = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'member') {
    sendError(res, 'Access forbidden: member role required', 403);
    return;
  }
  next();
};
