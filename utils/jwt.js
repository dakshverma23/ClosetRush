const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} userType - User type (individual, business, admin)
 * @returns {string} JWT token
 */
const generateToken = (userId, userType) => {
  const payload = {
    userId,
    userType,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Session expired. Please log in again.');
      err.statusCode = 401;
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }
    
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid authentication token');
      err.statusCode = 401;
      err.code = 'TOKEN_INVALID';
      throw err;
    }
    
    throw error;
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
