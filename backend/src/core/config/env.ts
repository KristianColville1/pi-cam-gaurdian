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
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // Pi Guard API
  PI_GUARD_URL: process.env.PI_GUARD_URL,

  // Bunny.net CDN Configuration
  // Video CDN (recording bucket)
  VIDEO_CDN_LIBRARY_ID: process.env.VIDEO_CDN_LIBRARY_ID,
  VIDEO_CDN_HOST: process.env.VIDEO_CDN_HOST,
  VIDEO_CDN_PULL_ZONE: process.env.VIDEO_CDN_PULL_ZONE,
  VIDEO_CDN_API_KEY: process.env.VIDEO_CDN_API_KEY,
  // Static Asset CDN (FTP)
  CDN_USER: process.env.CDN_USER,
  CDN_HOST: process.env.CDN_HOST,
  CDN_PORT: process.env.CDN_PORT ? parseInt(process.env.CDN_PORT, 10) : 21,
  CDN_CONNECTION_TYPE: process.env.CDN_CONNECTION_TYPE || 'PASSIVE',
  CDN_PASS: process.env.CDN_PASS,
};

