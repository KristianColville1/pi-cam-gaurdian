const { verifyToken } = require('../utils/jwt');

// Error classes - create simple error classes if they don't exist elsewhere
class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Middleware to authenticate requests
 * Extracts token from cookies or Authorization header and verifies it
 * Sets req.user with decoded token payload
 * @returns {Function} Express middleware function
 */
function authenticateRequest() {
  return (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        throw new UnauthorizedError('Authentication token missing');
      }

      const decoded = verifyToken(token);
      req.user = decoded;

      next();
    } catch (error) {
      next(error instanceof UnauthorizedError ? error : new UnauthorizedError('Authentication failed'));
    }
  };
}

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if token is missing or invalid
 * Sets req.user if valid token is found
 * @returns {Function} Express middleware function
 */
function optionalAuth() {
  return (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return next();
      }

      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch {
      next();
    }
  };
}

/**
 * Middleware to require specific user roles
 * Must be used after authenticateRequest() middleware
 * @param {string[]} allowedRoles - Array of allowed role strings
 * @returns {Function} Express middleware function
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

/**
 * Extract JWT token from request
 * Checks cookies first, then Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} Token string or null
 */
function extractToken(req) {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

module.exports = {
  authenticateRequest,
  optionalAuth,
  requireRole,
  UnauthorizedError,
  ForbiddenError,
};
