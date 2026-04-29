const User = require('../models/User');
const Session = require('../models/Session');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, address, userType } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password || !address) {
      throw ApiError.badRequest('All fields are required', {
        fields: ['name', 'email', 'mobile', 'password', 'address']
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw ApiError.badRequest(passwordValidation.message);
    }

    // Determine user type — respect explicit staff types from frontend,
    // otherwise auto-detect @closetrush.com as warehouse_manager
    const staffTypes = ['warehouse_manager', 'logistics_partner'];
    let finalUserType = userType || 'individual';
    let warehouseManagerStatus = undefined;
    let logisticsPartnerStatus = undefined;

    if (staffTypes.includes(userType)) {
      // Explicit staff registration from the staff portal
      finalUserType = userType;
      if (!email.endsWith('@closetrush.com')) {
        throw ApiError.badRequest('Staff accounts must use a @closetrush.com email address');
      }
      if (userType === 'warehouse_manager') {
        warehouseManagerStatus = 'pending';
      } else if (userType === 'logistics_partner') {
        logisticsPartnerStatus = 'pending';
      }
    } else if (email.endsWith('@closetrush.com') && !userType) {
      // Legacy fallback: @closetrush.com with no explicit type → warehouse_manager
      finalUserType = 'warehouse_manager';
      warehouseManagerStatus = 'pending';
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw ApiError.conflict('Email already registered', 'EMAIL_ALREADY_EXISTS');
      }
      if (existingUser.mobile === mobile) {
        throw ApiError.conflict('Mobile number already registered', 'MOBILE_ALREADY_EXISTS');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      address,
      userType: finalUserType,
      authProvider: 'email',
      warehouseManagerStatus,
      logisticsPartnerStatus
    });

    // Generate JWT token
    const token = generateToken(user._id, user.userType);

    // Create session
    await Session.createSession(user._id, token);

    // Different response message for staff types
    const isStaff = ['warehouse_manager', 'logistics_partner'].includes(finalUserType);
    const message = isStaff
      ? `${finalUserType === 'warehouse_manager' ? 'Warehouse manager' : 'Logistics partner'} registration submitted. Awaiting admin approval.`
      : 'User registered successfully';

    res.status(201).json({
      message,
      token,
      user: user.toJSON(),
      requiresApproval: isStaff
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Login with email and password
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const lockTimeRemaining = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
      throw ApiError.locked(
        `Account temporarily locked due to multiple failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
        'ACCOUNT_LOCKED'
      );
    }

    // Check if account is active
    if (!user.active) {
      throw ApiError.forbidden('Account is deactivated. Please contact support.');
    }

    // Check staff approval status
    if (user.userType === 'warehouse_manager' && user.warehouseManagerStatus !== 'approved') {
      if (user.warehouseManagerStatus === 'pending') {
        throw ApiError.forbidden('Your warehouse manager account is pending admin approval.', 'PENDING_APPROVAL');
      }
      throw ApiError.forbidden(
        `Your warehouse manager account was rejected. Reason: ${user.warehouseManagerRejectionReason || 'Not specified'}`,
        'ACCOUNT_REJECTED'
      );
    }
    if (user.userType === 'logistics_partner' && user.logisticsPartnerStatus !== 'approved') {
      if (user.logisticsPartnerStatus === 'pending') {
        throw ApiError.forbidden('Your logistics partner account is pending admin approval.', 'PENDING_APPROVAL');
      }
      throw ApiError.forbidden(
        `Your logistics partner account was rejected. Reason: ${user.logisticsPartnerRejectionReason || 'Not specified'}`,
        'ACCOUNT_REJECTED'
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      await user.incrementFailedAttempts();
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.resetFailedAttempts();
    }

    // Generate JWT token
    const token = generateToken(user._id, user.userType);

    // Create session
    await Session.createSession(user._id, token);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Login with mobile number and password
 * POST /api/auth/login/mobile
 */
const loginWithMobile = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    // Validate required fields
    if (!mobile || !password) {
      throw ApiError.badRequest('Mobile number and password are required');
    }

    // Find user by mobile
    const user = await User.findOne({ mobile });

    if (!user) {
      throw ApiError.unauthorized('Invalid mobile number or password', 'INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const lockTimeRemaining = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
      throw ApiError.locked(
        `Account temporarily locked due to multiple failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
        'ACCOUNT_LOCKED'
      );
    }

    // Check if account is active
    if (!user.active) {
      throw ApiError.forbidden('Account is deactivated. Please contact support.');
    }

    // Check staff approval status
    if (user.userType === 'warehouse_manager' && user.warehouseManagerStatus !== 'approved') {
      if (user.warehouseManagerStatus === 'pending') {
        throw ApiError.forbidden('Your warehouse manager account is pending admin approval.', 'PENDING_APPROVAL');
      }
      throw ApiError.forbidden(
        `Your warehouse manager account was rejected. Reason: ${user.warehouseManagerRejectionReason || 'Not specified'}`,
        'ACCOUNT_REJECTED'
      );
    }
    if (user.userType === 'logistics_partner' && user.logisticsPartnerStatus !== 'approved') {
      if (user.logisticsPartnerStatus === 'pending') {
        throw ApiError.forbidden('Your logistics partner account is pending admin approval.', 'PENDING_APPROVAL');
      }
      throw ApiError.forbidden(
        `Your logistics partner account was rejected. Reason: ${user.logisticsPartnerRejectionReason || 'Not specified'}`,
        'ACCOUNT_REJECTED'
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      await user.incrementFailedAttempts();
      throw ApiError.unauthorized('Invalid mobile number or password', 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.resetFailedAttempts();
    }

    // Generate JWT token
    const token = generateToken(user._id, user.userType);

    // Create session
    await Session.createSession(user._id, token);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.badRequest('No token provided');
    }

    // Invalidate session
    await Session.invalidateSession(token);

    res.status(200).json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth authentication
 * POST /api/auth/google
 */
const googleAuth = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw ApiError.badRequest('Authorization code is required');
    }

    // Note: This is a simplified implementation
    // In production, you would:
    // 1. Exchange code for access token with Google
    // 2. Get user info from Google API
    // 3. Find or create user
    // 4. Generate JWT token
    // 5. Create session

    // For now, we'll use passport strategy which is configured in config/passport.js
    // The actual OAuth flow should be handled by passport middleware in routes

    throw ApiError.internal('Use /api/auth/google/callback route with passport');

  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth callback handler
 * Called by passport after successful Google authentication
 */
const googleCallback = async (req, res, next) => {
  try {
    // User is attached to req by passport
    const user = req.user;

    if (!user) {
      throw ApiError.unauthorized('Google authentication failed');
    }

    // Generate JWT token
    const token = generateToken(user._id, user.userType);

    // Create session
    await Session.createSession(user._id, token);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  loginWithMobile,
  logout,
  googleAuth,
  googleCallback
};
