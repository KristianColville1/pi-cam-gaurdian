require('reflect-metadata');
const path = require('path');
const { initializeDatabase, AppDataSource } = require('../core/config/database');

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Initialize database connection (will create SQLite file if it doesn't exist)
    await initializeDatabase();
    
    console.log('✓ Database initialized successfully');
    console.log(`✓ Database file location: ${AppDataSource.options.database}`);
    
    // Close the connection
    await AppDataSource.destroy();
    console.log('✓ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();

