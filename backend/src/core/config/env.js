import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../../.env') });

export default {
  // Server
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  FRONTEND_URL: process.env.FRONTEND_URL || '*',

  // Database
  DB_TYPE: process.env.DB_TYPE || 'better-sqlite3',
  DB_DATABASE: process.env.DB_DATABASE || './db.sqlite3',
  DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true' || true,
  DB_LOGGING: process.env.DB_LOGGING === 'true' || false,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};
