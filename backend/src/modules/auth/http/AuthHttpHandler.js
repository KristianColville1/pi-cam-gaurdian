import { AppDataSource } from '../../../core/config/database.js';
import { generateToken } from '../../../core/utils/jwt.js';
import bcrypt from 'bcrypt';
import { User } from '../entities/User.entity.js';

/**
 * HTTP handler for authentication endpoints
 */
class AuthHttpHandler {
  /**
   * Login handler
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Get repository
      const UserRepository = AppDataSource.getRepository(User);

      // Find user by email
      const user = await UserRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken({
        sub: user.id,
        email: user.email,
        role: 'user', // You can add role field to User entity later
      });

      // Set cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Return user data (without password)
      const { password_hash, ...userData } = user;
      res.json({ user: userData, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Register handler
   */
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Get repository
      const UserRepository = AppDataSource.getRepository(User);

      // Check if user already exists
      const existingUser = await UserRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = UserRepository.create({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        is_active: true,
        is_verified: false,
      });

      await UserRepository.save(user);

      // Generate JWT token
      const token = generateToken({
        sub: user.id,
        email: user.email,
        role: 'user',
      });

      // Set cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Return user data (without password)
      const { password_hash, ...userData } = user;
      res.status(201).json({ user: userData, token });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Logout handler
   */
  async logout(req, res) {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
  }

  /**
   * Get current user handler
   */
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.sub;
      const UserRepository = AppDataSource.getRepository(User);
      const user = await UserRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password_hash, ...userData } = user;
      res.json({ user: userData });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthHttpHandler;

