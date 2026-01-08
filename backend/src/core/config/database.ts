import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import env from './env.js';
import { User } from '../../modules/auth/entities/User.entity.js';
import { Device } from '../../modules/devices/entities/Device.entity.js';
import { SensorMetric } from '../../modules/metrics/entities/SensorMetric.entity.js';
import { File } from '../../modules/storage/entities/File.entity.js';
import { Recording } from '../../modules/storage/entities/Recording.entity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: env.DB_TYPE as any,
  database: resolve(__dirname, '../../../../', env.DB_DATABASE),
  synchronize: env.DB_SYNCHRONIZE,
  logging: env.DB_LOGGING,
  entities: [
    User,
    Device,
    SensorMetric,
    File,
    Recording,
    // Add more entities here as needed
  ],
  migrations: [
    // Migrations will be added here
  ],
});

export async function initializeDatabase() {
  if (AppDataSource.isInitialized) {
    return;
  }

  try {
    await AppDataSource.initialize();
    console.log('✓ Database connection established');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}

