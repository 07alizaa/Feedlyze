

// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Business = require('../models/Business');
const PasswordResetToken = require('../models/PasswordResetToken');
const logger = require('../utils/logger');
const { JWT_EXPIRES_IN } = require('../utils/constants');

/**
 * Generate JWT token
 */
const generateToken = (businessId) => {
  return jwt.sign(
    { id: businessId },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Register new business
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { business_name, email, password, industry, phone } = req.body;

    // Check if email already exists
    const emailExists = await Business.emailExists(email);
    
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create business
    const business = await Business.create({
      business_name,
      email,
      password,
      industry,
      phone
    });

    // Generate JWT token
    const token = generateToken(business.id);

    logger.info(`New business registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Business registered successfully',
      data: {
        business,
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login business
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find business by email
    const business = await Business.findByEmail(email);

    if (!business) {
      logger.warn(`Login failed: No business found for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await Business.verifyPassword(password, business.password_hash);

    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Remove password_hash from response
    delete business.password_hash;

    // Generate JWT token
    let token;
    try {
      token = generateToken(business.id);
    } catch (jwtError) {
      logger.error('JWT generation error during login', {
        email,
        businessId: business.id,
        jwtError: jwtError.message,
        stack: jwtError.stack,
        envJwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || JWT_EXPIRES_IN
      });
      return res.status(500).json({
        success: false,
        error: 'Internal server error (token)'
      });
    }

    logger.info(`Business logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        business,
        token
      }
    });
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      envJwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || JWT_EXPIRES_IN
    });
    next(error);
  }
};

/**
 * Handle forgot password request
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const business = await Business.findByEmail(email);

    if (business) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await PasswordResetToken.create(business.id, resetToken);

      // In a real application, you would send an email with the resetToken.
      // For this implementation, we'll log it for development purposes.
      logger.info(`Password reset token for ${email}: ${resetToken}`);
    }

    // Always return a success response to prevent user enumeration
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

/**
 * Handle password reset
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and password are required' });
    }

    const tokenRecord = await PasswordResetToken.findByToken(token);

    if (!tokenRecord || tokenRecord.used_at) {
      return res.status(400).json({ success: false, error: 'Token is invalid or has already been used' });
    }

    const isExpired = new Date() > new Date(tokenRecord.expires_at);
    if (isExpired) {
      return res.status(400).json({ success: false, error: 'Token has expired' });
    }

    await Business.updatePassword(tokenRecord.business_id, password);
    await PasswordResetToken.markAsUsed(tokenRecord.id);

    logger.info(`Password has been reset for business ID: ${tokenRecord.business_id}`);

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};


/**
 * Get current business profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is attached by verifyToken middleware
    const business = req.user;

    // Get business statistics
    const stats = await Business.getStats(business.id);

    res.status(200).json({
      success: true,
      data: {
        business,
        stats
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

/**
 * Update business profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { business_name, industry, phone } = req.body;
    const businessId = req.userId;

    // Update business
    const updatedBusiness = await Business.update(businessId, {
      business_name,
      industry,
      phone
    });

    logger.info(`Business profile updated: ${updatedBusiness.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedBusiness
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

/**
 * Handle Google OAuth callback
 * GET /api/auth/google/callback
 */
const googleCallback = async (req, res, next) => {
  try {
    const business = req.user;
    const token = generateToken(business.id);

    logger.info(`Google login successful: ${business.email}`);

    // NOTE: In a production SPA, you would typically redirect to the frontend
    // with the token in the URL, e.g.:
    // return res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    
    // Returning JSON to match strict output requirements
    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        business,
        token
      }
    });
  } catch (error) {
    logger.error('Google login error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  googleCallback,
  forgotPassword,
  resetPassword,
};