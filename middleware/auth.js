const { verifyToken } = require('../utils/jwt');
const Session = require('../models/Session');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided', 'TOKEN_MISSING');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    const decoded = verifyToken(token);

    // Check if session exists and is valid
    const session = await Session.findValidSession(token);

    if (!session) {
      throw ApiError.unauthorized('Invalid or expired session', 'SESSION_INVALID');
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw ApiError.unauthorized('User not found', 'USER_NOT_FOUND');
    }

    // Check if user is active
    if (!user.active) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is provided, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    const session = await Session.findValidSession(token);

    if (session) {
      const user = await User.findById(decoded.userId);
      if (user && user.active) {
        req.user = user;
        req.token = token;
      }
    }

    next();

  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
};

/**
 * Authorization middleware factory
 * Creates middleware to check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (!roles.includes(req.user.userType)) {
        throw ApiError.forbidden('You do not have permission to perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  protect: authenticate, // Alias for authenticate
  authorize
};
