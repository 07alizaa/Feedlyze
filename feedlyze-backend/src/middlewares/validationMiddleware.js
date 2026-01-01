// src/middlewares/validationMiddleware.js
const { body, param, query, validationResult } = require('express-validator');

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

// ==========================================
// AUTH VALIDATIONS
// ==========================================

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

// ==========================================
// SURVEY VALIDATIONS
// ==========================================

/**
 * Validation rules for creating a survey
 */
const createSurveyValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Survey title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  
  validate
];

/**
 * Validation rules for updating a survey
 */
const updateSurveyValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid survey ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean'),
  
  validate
];

// ==========================================
// QUESTION VALIDATIONS
// ==========================================

const validQuestionTypes = ['rating', 'text', 'multiple_choice', 'yes_no', 'scale'];

/**
 * Validation rules for creating a question
 */
const createQuestionValidation = [
  body('survey_id')
    .isInt({ min: 1 }).withMessage('Valid survey ID is required'),
  
  body('question_text')
    .trim()
    .notEmpty().withMessage('Question text is required')
    .isLength({ min: 5, max: 500 }).withMessage('Question must be between 5 and 500 characters'),
  
  body('question_type')
    .trim()
    .notEmpty().withMessage('Question type is required')
    .isIn(validQuestionTypes).withMessage(`Question type must be one of: ${validQuestionTypes.join(', ')}`),
  
  body('is_required')
    .optional()
    .isBoolean().withMessage('is_required must be a boolean'),
  
  body('options')
    .optional()
    .custom((value) => {
      if (value && !Array.isArray(value) && typeof value !== 'object') {
        throw new Error('Options must be an array or object');
      }
      return true;
    }),
  
  validate
];

/**
 * Validation rules for updating a question
 */
const updateQuestionValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid question ID'),
  
  body('question_text')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Question must be between 5 and 500 characters'),
  
  body('question_type')
    .optional()
    .trim()
    .isIn(validQuestionTypes).withMessage(`Question type must be one of: ${validQuestionTypes.join(', ')}`),
  
  validate
];

// ==========================================
// RESPONSE VALIDATIONS
// ==========================================

/**
 * Validation rules for submitting a response
 */
const submitResponseValidation = [
  param('surveyId')
    .isInt({ min: 1 }).withMessage('Invalid survey ID'),
  
  body('answers')
    .isArray({ min: 1 }).withMessage('At least one answer is required'),
  
  body('answers.*.question_id')
    .isInt({ min: 1 }).withMessage('Valid question ID is required for each answer'),
  
  body('answers.*.answer_text')
    .optional()
    .isString().withMessage('Answer text must be a string'),
  
  body('answers.*.rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('respondent_email')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  
  validate
];

// ==========================================
// PARAM VALIDATIONS (Reusable)
// ==========================================

/**
 * Validate ID parameter
 */
const idParamValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID parameter'),
  validate
];

/**
 * Validate surveyId parameter
 */
const surveyIdParamValidation = [
  param('surveyId')
    .isInt({ min: 1 }).withMessage('Invalid survey ID'),
  validate
];

// ==========================================
// ANALYSIS VALIDATIONS
// ==========================================

/**
 * Validation for analysis trigger
 */
const triggerAnalysisValidation = [
  param('surveyId')
    .isInt({ min: 1 }).withMessage('Invalid survey ID'),
  validate
];

// ==========================================
// CHATBOT VALIDATIONS
// ==========================================

/**
 * Validation for chatbot message
 */
const chatMessageValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  
  body('context')
    .optional()
    .isObject().withMessage('Context must be an object'),
  
  validate
];

/**
 * Validation for survey generation
 */
const generateSurveyValidation = [
  body('description')
    .trim()
    .notEmpty().withMessage('Survey description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Industry must be less than 100 characters'),
  
  body('questionCount')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage('Question count must be between 1 and 20'),
  
  validate
];

module.exports = {
  validate,
  // Auth
  registerValidation,
  loginValidation,
  updateProfileValidation,
  // Survey
  createSurveyValidation,
  updateSurveyValidation,
  // Question
  createQuestionValidation,
  updateQuestionValidation,
  // Response
  submitResponseValidation,
  // Analysis
  triggerAnalysisValidation,
  // Chatbot
  chatMessageValidation,
  generateSurveyValidation,
  // Reusable
  idParamValidation,
  surveyIdParamValidation
};