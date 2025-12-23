// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const Business = require('../models/Business');
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
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await Business.verifyPassword(password, business.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Remove password_hash from response
    delete business.password_hash;

    // Generate JWT token
    const token = generateToken(business.id);

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
    logger.error('Login error:', error);
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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};