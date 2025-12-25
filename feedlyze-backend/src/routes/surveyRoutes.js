// src/routes/surveyRoutes.js
const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { body, param } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

// Create survey validation
const createSurveyValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.question_text').trim().notEmpty().withMessage('Question text is required'),
  body('questions.*.question_type').isIn(['text', 'rating', 'mcq']).withMessage('Invalid question type'),
  validate
];

// Update survey validation
const updateSurveyValidation = [
  param('id').isInt().withMessage('Invalid survey ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  validate
];

/**
 * @route   POST /api/surveys/create
 * @desc    Create new survey with questions and QR code
 * @access  Private
 */
router.post('/create', verifyToken, createSurveyValidation, surveyController.createSurvey);

/**
 * @route   GET /api/surveys
 * @desc    Get all surveys for logged-in business
 * @access  Private
 */
router.get('/', verifyToken, surveyController.getSurveys);

/**
 * @route   GET /api/surveys/public/:shortCode
 * @desc    Get public survey by short code (no auth)
 * @access  Public
 */
router.get('/public/:shortCode', surveyController.getPublicSurvey);

/**
 * @route   GET /api/surveys/:id
 * @desc    Get single survey with questions and stats
 * @access  Private
 */
router.get('/:id', verifyToken, surveyController.getSurveyById);

/**
 * @route   PUT /api/surveys/:id
 * @desc    Update survey details
 * @access  Private
 */
router.put('/:id', verifyToken, updateSurveyValidation, surveyController.updateSurvey);

/**
 * @route   PATCH /api/surveys/:id/toggle
 * @desc    Toggle survey active status
 * @access  Private
 */
router.patch('/:id/toggle', verifyToken, surveyController.toggleSurveyStatus);

/**
 * @route   DELETE /api/surveys/:id
 * @desc    Delete survey (cascades to questions and responses)
 * @access  Private
 */
router.delete('/:id', verifyToken, surveyController.deleteSurvey);

/**
 * @route   POST /api/surveys/:id/regenerate-qr
 * @desc    Regenerate QR code for survey
 * @access  Private
 */
router.post('/:id/regenerate-qr', verifyToken, surveyController.regenerateQR);

module.exports = router;