const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} payload.sub - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @returns {string} JWT token
 */
function generateToken(payload) {
  const options = {};

  if (env.JWT_EXPIRES_IN) {
    options.expiresIn = env.JWT_EXPIRES_IN;
  }

  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid
 */
function verifyToken(token) {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return decoded;
}

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null
 */
function decodeToken(token) {
  const decoded = jwt.decode(token);
  if (!decoded) {
    return null;
  }
  return decoded;
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};