import 'reflect-metadata';
import { Controller } from '../../../core/decorators/controller.js';
import { applyRoute } from '../../../core/decorators/route.js';
import { applyApiDoc } from '../../../core/decorators/docs.js';
import { authenticateRequest } from '../../../core/middleware/auth.js';

// Note: AuthHttpHandler and validators need to be created/imported when available
// import AuthHttpHandler from '../http/AuthHttpHandler.js';
// import { LoginSchema, RegisterSchema } from '../../../shared/validators/auth.schemas.js';

/**
 * Declarative HTTP surface for authentication endpoints.
 * Each method delegates to the HTTP handler so controllers stay lean.
 */
// const authHttpHandler = new AuthHttpHandler();

class AuthController {
  /**
   * POST /auth/login – authenticate via credentials and issue cookie.
   */
  async login(req, res) {
    // TODO: Implement or delegate to authHttpHandler.login(req, res);
    res.status(501).json({ error: 'Not implemented' });
  }

  /**
   * POST /auth/register – create an account and start a session.
   */
  async register(req, res) {
    // TODO: Implement or delegate to authHttpHandler.register(req, res);
    res.status(501).json({ error: 'Not implemented' });
  }

  /**
   * POST /auth/logout – clear the auth cookie for the active user.
   */
  async logout(req, res) {
    // TODO: Implement or delegate to authHttpHandler.logout(req, res);
    res.status(501).json({ error: 'Not implemented' });
  }

  /**
   * GET /auth/me – get current authenticated user profile.
   */
  async getCurrentUser(req, res) {
    // TODO: Implement or delegate to authHttpHandler.getCurrentUser(req, res);
    res.status(501).json({ error: 'Not implemented' });
  }
}

// Apply route decorators manually (since JavaScript doesn't support decorator syntax)
applyRoute(AuthController, 'login', 'post', '/login');
applyApiDoc(AuthController, 'login', {
  summary: 'User login',
  description: 'Authenticate user with email and password, returning user profile and session cookie.',
  tags: ['Auth'],
  operationId: 'login',
  request: {
    // body: LoginSchema, // TODO: Add when validators are created
  },
  responses: {
    200: { description: 'Login successful' },
    400: { description: 'Validation error' },
    401: { description: 'Invalid credentials' },
  },
});

applyRoute(AuthController, 'register', 'post', '/register');
applyApiDoc(AuthController, 'register', {
  summary: 'Register user',
  description: 'Create a user account and start an authenticated session.',
  tags: ['Auth'],
  operationId: 'register',
  request: {
    // body: RegisterSchema, // TODO: Add when validators are created
  },
  responses: {
    201: { description: 'Registration successful' },
    400: { description: 'Validation error' },
    409: { description: 'Email already registered' },
  },
});

applyRoute(AuthController, 'logout', 'post', '/logout', authenticateRequest());
applyApiDoc(AuthController, 'logout', {
  summary: 'Logout user',
  description: 'Invalidate the active session cookie.',
  tags: ['Auth'],
  operationId: 'logout',
  responses: {
    200: { description: 'Logout successful' },
    401: { description: 'Authentication required' },
  },
});

applyRoute(AuthController, 'getCurrentUser', 'get', '/me', authenticateRequest());
applyApiDoc(AuthController, 'getCurrentUser', {
  summary: 'Get current user',
  description: 'Return the authenticated user profile.',
  tags: ['Auth'],
  operationId: 'getCurrentUser',
  responses: {
    200: { description: 'Current user profile' },
    401: { description: 'Authentication required' },
    404: { description: 'User not found' },
  },
});

// Apply Controller decorator manually (since JavaScript doesn't support decorator syntax)
Controller('/auth')(AuthController);

export default AuthController;
