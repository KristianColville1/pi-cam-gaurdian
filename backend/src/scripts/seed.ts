import { AppDataSource } from '../core/config/database.js';
import { User } from '../modules/auth/entities/User.entity.js';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('Starting database seed...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✓ Database connection established');
    }

    const UserRepository = AppDataSource.getRepository(User);

    const existingAdmin = await UserRepository.findOne({
      where: { email: 'test@test.com' },
    });

    if (existingAdmin) {
      console.log('⚠ Admin user already exists. Skipping seed.');
      await AppDataSource.destroy();
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('admin123', 10);

    const adminUser = UserRepository.create({
      email: 'test@test.com',
      password_hash: passwordHash,
      first_name: 'Admin',
      last_name: 'User',
      is_active: true,
      is_verified: true,
    });

    await UserRepository.save(adminUser);

    console.log('✓ Admin user created successfully');
    console.log('  Email: test@test.com');
    console.log('  Password: admin123');

    await AppDataSource.destroy();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to seed database:', error);
    await AppDataSource.destroy().catch(() => {});
    process.exit(1);
  }
}

seed();

