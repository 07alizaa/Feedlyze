// src/routes/analysisRoutes.js
const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * @route   POST /api/analysis/response/:id
 * @desc    Analyze a single response
 * @access  Private
 */
router.post(
  '/response/:id',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Valid response ID is required')],
  validate,
  analysisController.analyzeResponse
);

/**
 * @route   GET /api/analysis/response/:id
 * @desc    Get analysis for a response
 * @access  Private
 */
router.get(
  '/response/:id',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Valid response ID is required')],
  validate,
  analysisController.getResponseAnalysis
);

/**
 * @route   POST /api/analysis/survey/:surveyId
 * @desc    Analyze all unanalyzed responses for a survey
 * @access  Private
 */
router.post(
  '/survey/:surveyId',
  verifyToken,
  [param('surveyId').isInt({ min: 1 }).withMessage('Valid survey ID is required')],
  validate,
  analysisController.analyzeSurvey
);

/**
 * @route   GET /api/analysis/survey/:surveyId/summary
 * @desc    Get sentiment summary for a survey
 * @access  Private
 */
router.get(
  '/survey/:surveyId/summary',
  verifyToken,
  [param('surveyId').isInt({ min: 1 }).withMessage('Valid survey ID is required')],
  validate,
  analysisController.getSurveySentimentSummary
);

module.exports = router;
