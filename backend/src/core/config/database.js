const { DataSource } = require('typeorm');
const env = require('./env');

const AppDataSource = new DataSource({
  type: env.DB_TYPE,
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  synchronize: env.DB_SYNCHRONIZE,
  logging: env.DB_LOGGING,
  entities: [
    // Entities will be added here
    // Example: require('../../entities/User.js')
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