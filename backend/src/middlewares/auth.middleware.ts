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
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      tier: decoded.tier,
      type: decoded.role === 'member' ? 'member' : 'staff',
    };
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired access token', 401);
  }
};

export const requireRoles = (...roles: (UserRole | string)[]) => {
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

export const requireSelfOrRole = (...allowedRoles: (UserRole | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetId = parseInt(rawId, 10);
    const userId = req.user.sub ?? req.user.id;
    if (userId === targetId) {
      return next();
    }

    sendError(res, 'Access denied. You can only view or modify your own resources.', 403);
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

export const verifyToken = authenticate;

export const requireRole = (...roles: string[]) => {
  return requireRoles(...(roles as UserRole[]));
};

export const requireSelfOrRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const targetId = parseInt(req.params.id as string, 10);
    const isSelf = req.user.role === 'member' && !isNaN(targetId) && req.user.id === targetId;
    const hasRole = (allowedRoles as string[]).includes(req.user.role);

    if (isSelf || hasRole) {
      next();
      return;
    }

    sendError(res, 'Access forbidden: insufficient permissions', 403);
  };
};

// Aliases for cross-module compatibility (Dev A & Dev B)
export const verifyToken = authenticate;
export const requireRole = requireRoles;
