import { verifyToken } from '../utils/jwt.js';
export class UnauthorizedError extends Error {
    statusCode;
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
        this.statusCode = 401;
    }
}
export class ForbiddenError extends Error {
    statusCode;
    constructor(message = 'Forbidden') {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}
const AUTH_COOKIE_NAME = 'auth_token';
/**
 * Middleware to authenticate requests
 */
export function authenticateRequest() {
    return (req, res, next) => {
        try {
            const token = extractToken(req);
            if (!token) {
                throw new UnauthorizedError('Authentication token missing');
            }
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        }
        catch (error) {
            next(error instanceof UnauthorizedError ? error : new UnauthorizedError('Authentication failed'));
        }
    };
}
/**
 * Optional authentication middleware
 */
export function optionalAuth() {
    return (req, res, next) => {
        try {
            const token = extractToken(req);
            if (!token) {
                return next();
            }
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        }
        catch {
            next();
        }
    };
}
/**
 * Middleware to require specific user roles
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return next(new UnauthorizedError());
        }
        if (!allowedRoles.includes(user.role)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }
        next();
    };
}
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
//# sourceMappingURL=auth.js.map