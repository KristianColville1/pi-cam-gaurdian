import 'reflect-metadata';
import { Request, Response } from 'express';
import { Controller } from '../../../core/decorators/controller.js';
import { route } from '../../../core/decorators/route.js';
import { apiDoc } from '../../../core/decorators/docs.js';
import { authenticateRequest } from '../../../core/middleware/auth.js';

import AuthHttpHandler from '../http/AuthHttpHandler.js';

const authHttpHandler = new AuthHttpHandler();

@Controller('/auth')
class AuthController {
  @route('post', '/login')
  @apiDoc({
    summary: 'User login',
    description: 'Authenticate user with email and password, returning user profile and session cookie.',
    tags: ['Auth'],
    operationId: 'login',
    request: {},
    responses: {
      200: { description: 'Login successful' },
      400: { description: 'Validation error' },
      401: { description: 'Invalid credentials' },
    },
  })
  async login(req: Request, res: Response) {
    return authHttpHandler.login(req, res);
  }

  @route('post', '/register')
  @apiDoc({
    summary: 'Register user',
    description: 'Create a user account and start an authenticated session.',
    tags: ['Auth'],
    operationId: 'register',
    request: {},
    responses: {
      201: { description: 'Registration successful' },
      400: { description: 'Validation error' },
      409: { description: 'Email already registered' },
    },
  })
  async register(req: Request, res: Response) {
    return authHttpHandler.register(req, res);
  }

  @route('post', '/logout', authenticateRequest())
  @apiDoc({
    summary: 'Logout user',
    description: 'Invalidate the active session cookie.',
    tags: ['Auth'],
    operationId: 'logout',
    responses: {
      200: { description: 'Logout successful' },
      401: { description: 'Authentication required' },
    },
  })
  async logout(req: Request, res: Response) {
    return authHttpHandler.logout(req, res);
  }

  @route('get', '/me', authenticateRequest())
  @apiDoc({
    summary: 'Get current user',
    description: 'Return the authenticated user profile.',
    tags: ['Auth'],
    operationId: 'getCurrentUser',
    responses: {
      200: { description: 'Current user profile' },
      401: { description: 'Authentication required' },
      404: { description: 'User not found' },
    },
  })
  async getCurrentUser(req: Request, res: Response) {
    return authHttpHandler.getCurrentUser(req, res);
  }
}

export default AuthController;

