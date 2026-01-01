import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import env from './env.js';
import { User } from '../../modules/auth/entities/User.entity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: env.DB_TYPE,
  database: resolve(__dirname, '../../../', env.DB_DATABASE),
  synchronize: env.DB_SYNCHRONIZE,
  logging: env.DB_LOGGING,
  entities: [
    User,
    // Add more entities here as needed
    // join(__dirname, '../../modules/**/entities/*.entity.js'),
  ],
  migrations: [
    // Migrations will be added here
    // Example: 'src/migrations/**/*.js'
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
