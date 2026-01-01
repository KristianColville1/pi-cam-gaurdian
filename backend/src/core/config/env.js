const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DB_TYPE: process.env.DB_TYPE || 'better-sqlite3',
  DB_DATABASE: process.env.DB_DATABASE || './db.sqlite3',
  DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true' || true,
  DB_LOGGING: process.env.DB_LOGGING === 'true' || false,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};
