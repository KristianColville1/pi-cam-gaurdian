const { DataSource } = require('typeorm');
const path = require('path');
const env = require('./env');

const AppDataSource = new DataSource({
  type: env.DB_TYPE,
  database: path.resolve(__dirname, '../../../', env.DB_DATABASE),
  synchronize: env.DB_SYNCHRONIZE,
  logging: env.DB_LOGGING,
  entities: [
    path.join(__dirname, '../../modules/**/entities/*.entity.js'),
  ],
  migrations: [
    // Migrations will be added here
    // Example: 'src/migrations/**/*.js'
  ],
});

async function initializeDatabase() {
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

module.exports = {
  AppDataSource,
  initializeDatabase,
};