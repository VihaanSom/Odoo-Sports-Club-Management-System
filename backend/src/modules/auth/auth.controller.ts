import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
} from '../../utils/token';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class AuthController {
  /**
   * AU-01: Unified login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);

      // Set httpOnly refresh cookie
      setRefreshTokenCookie(res, result.refreshToken);

      sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user,
        },
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * AU-02: Refresh access token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      if (!refreshToken) {
        throw new UnauthorizedError(
          'Refresh token cookie missing',
          'INVALID_REFRESH_TOKEN'
        );
      }

      const result = await authService.refresh(refreshToken);

      // Token rotation: update httpOnly cookie with newly minted refresh token
      setRefreshTokenCookie(res, result.refreshToken);

      sendSuccess(res, {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * AU-03: Logout
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      clearRefreshTokenCookie(res);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * AU-04: Get current authenticated user profile
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userProfile = await authService.getMe(req.user.id, req.user.role);
      sendSuccess(res, userProfile);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
