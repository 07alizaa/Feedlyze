// src/middlewares/validationMiddleware.js
const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for business registration
 */
const registerValidation = [
  body('business_name')
    .trim()
    .notEmpty().withMessage('Business name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Business name must be between 2 and 255 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Industry must be less than 100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  
  validate
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

/**
 * Validation rules for profile update
 */
const updateProfileValidation = [
  body('business_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Business name must be between 2 and 255 characters'),
  
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Industry must be less than 100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation
};