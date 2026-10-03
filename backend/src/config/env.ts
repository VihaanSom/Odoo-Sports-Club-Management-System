import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required and must not be empty'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET is required and must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET is required and must be at least 16 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ ========================================================');
  console.error('❌ FATAL CONFIGURATION ERROR: Environment Misconfigured');
  console.error('❌ ========================================================');
  parsed.error.issues.forEach((issue) => {
    const fieldName = issue.path.join('.') || 'CONFIGURATION';
    console.error(`👉 [${fieldName}]: ${issue.message}`);
  });
  console.error('❌ --------------------------------------------------------');
  console.error('❌ Please check your .env file or environment variables.');
  console.error('❌ Server startup aborted to prevent insecure execution.\n');
  process.exit(1);
}

export const env = parsed.data;
