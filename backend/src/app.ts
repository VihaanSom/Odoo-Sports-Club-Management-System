import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import apiRouter from './routes/api.router';
import { errorHandler } from './middlewares/error.middleware';
import { sendSuccess, sendError } from './utils/response';

export const createApp = (): Application => {
  const app: Application = express();

  // Middleware
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads directory for photos
  app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    sendSuccess(res, {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }, 'Champions Club Backend API is running healthy');
  });

  // API v1 Routes
  app.use('/api/v1', apiRouter);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    sendError(res, 'Route not found', 404);
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
