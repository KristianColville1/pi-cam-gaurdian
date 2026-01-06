import { Request, Response } from 'express';
import { AppDataSource } from '../../../core/config/database.js';
import { generateToken } from '../../../core/utils/jwt.js';
import bcrypt from 'bcrypt';
import { User } from '../entities/User.entity.js';

class AuthHttpHandler {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const UserRepository = AppDataSource.getRepository(User);
      const user = await UserRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, (user as any).password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({
        sub: user.id,
        email: user.email,
        role: 'user',
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      const { password_hash, ...userData } = user;
      res.json({ user: userData, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const UserRepository = AppDataSource.getRepository(User);
      const existingUser = await UserRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = UserRepository.create({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        is_active: true,
        is_verified: false,
      });

      await UserRepository.save(user);

      const token = generateToken({
        sub: user.id,
        email: user.email,
        role: 'user',
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      const { password_hash, ...userData } = user;
      res.status(201).json({ user: userData, token });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
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

