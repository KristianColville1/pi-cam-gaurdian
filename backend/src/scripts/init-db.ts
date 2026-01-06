import { initializeDatabase, AppDataSource } from '../core/config/database.js';

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    await initializeDatabase();
    
    console.log('✓ Database initialized successfully');
    console.log(`✓ Database file location: ${AppDataSource.options.database}`);
    
    await AppDataSource.destroy();
    console.log('✓ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();

