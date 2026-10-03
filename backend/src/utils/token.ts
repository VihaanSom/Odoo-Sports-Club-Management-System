import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';
import { TokenPayload } from '../types';

export const REFRESH_COOKIE_NAME = 'refreshToken';
export const REFRESH_COOKIE_PATH = '/api/v1/auth';
export const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 900; // 15 minutes (900 seconds)

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as TokenPayload;
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.cookie(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  });
};
