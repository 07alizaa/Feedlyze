// src/routes/responseRoutes.js
const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');

// ==========================================
// PUBLIC ROUTES (No authentication needed)
// ==========================================

/**
 * Submit feedback
 * POST /api/responses/submit
 * 
 * This is what customers use - no login required
 */
router.post(
  '/submit',
  [
    body('survey_id')
      .isInt({ min: 1 })
      .withMessage('Valid survey ID is required'),
    body('answers')
      .isArray({ min: 1 })
      .withMessage('At least one answer is required'),
    body('answers.*.question_id')
      .isInt({ min: 1 })
      .withMessage('Each answer must have a valid question_id'),
    body('device_type')
      .optional()
      .isIn(['mobile', 'tablet', 'desktop', 'unknown'])
      .withMessage('Invalid device type')
  ],
  validate,
  responseController.submitFeedback
);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

/**
 * Get all responses for a survey
 * GET /api/responses/survey/:surveyId
 */
router.get(
  '/survey/:surveyId',
  verifyToken,
  [
    param('surveyId')
      .isInt({ min: 1 })
      .withMessage('Valid survey ID is required')
  ],
  validate,
  responseController.getResponsesBySurvey
);

/**
 * Get single response with answers
 * GET /api/responses/:id
 */
router.get(
  '/:id',
  verifyToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid response ID is required')
  ],
  validate,
  responseController.getResponseById
);

/**
 * Delete a response
 * DELETE /api/responses/:id
 */
router.delete(
  '/:id',
  verifyToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid response ID is required')
  ],
  validate,
  responseController.deleteResponse
);

module.exports = router;
