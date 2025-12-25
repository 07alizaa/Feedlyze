// src/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Create rate limiter with custom options
 */
const createLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes
 */
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  }
});

/**
 * Moderate rate limiter for API endpoints
 * 100 requests per 15 minutes
 */
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

/**
 * Strict rate limiter for resource creation
 * 20 requests per hour
 */
const createLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    error: 'Too many creation requests, please try again later'
  }
});

/**
 * Very strict rate limiter for AI/chatbot endpoints
 * 10 requests per minute (expensive API calls)
 */
const aiLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: 'Too many AI requests, please slow down'
  }
});

module.exports = {
  createLimiter,
  authLimiter,
  apiLimiter,
  aiLimiter
};