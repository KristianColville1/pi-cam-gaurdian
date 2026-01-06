import jwt from 'jsonwebtoken';
import env from '../config/env.js';
/**
 * Generate JWT token
 */
export function generateToken(payload) {
    const options = {};
    if (env.JWT_EXPIRES_IN) {
        options.expiresIn = env.JWT_EXPIRES_IN;
    }
    return jwt.sign(payload, env.JWT_SECRET, options);
}
/**
 * Verify and decode JWT token
 */
export function verifyToken(token) {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
}
/**
 * Decode JWT token without verification
 */
export function decodeToken(token) {
    const decoded = jwt.decode(token);
    if (!decoded) {
        return null;
    }
    return decoded;
}
//# sourceMappingURL=jwt.js.map