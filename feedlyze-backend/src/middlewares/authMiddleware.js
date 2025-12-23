// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const Business = require('../models/Business');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if business still exists
    const business = await Business.findById(decoded.id);
    
    if (!business) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Business not found'
      });
    }

    // Attach business to request
    req.user = business;
    req.userId = decoded.id;

    next();
  } catch (error) {
    logger.error('Token verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const business = await Business.findById(decoded.id);

    if (business) {
      req.user = business;
      req.userId = decoded.id;
    }

    next();
  } catch (error) {
    // Token invalid, but continue anyway
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
};