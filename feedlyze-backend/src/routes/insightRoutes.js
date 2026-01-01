// src/routes/insightRoutes.js
const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { param, query, body } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * @route   GET /api/insights/weekly
 * @desc    Get weekly insights for logged-in business
 * @access  Private
 * @query   startDate, endDate, limit
 */
router.get(
  '/weekly',
  verifyToken,
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('startDate must be a valid date (YYYY-MM-DD)'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('endDate must be a valid date (YYYY-MM-DD)'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 52 })
      .withMessage('limit must be between 1 and 52')
  ],
  validate,
  insightController.getWeeklyInsights
);

/**
 * @route   GET /api/insights/dashboard
 * @desc    Get dashboard summary with trends and themes
 * @access  Private
 */
router.get(
  '/dashboard',
  verifyToken,
  insightController.getDashboard
);

/**
 * @route   GET /api/insights/overview
 * @desc    Get overview statistics for dashboard cards
 * @access  Private
 */
router.get(
  '/overview',
  verifyToken,
  insightController.getOverviewStats
);

/**
 * @route   GET /api/insights/themes
 * @desc    Get theme/entity breakdown for charts
 * @access  Private
 * @query   limit (default: 10)
 */
router.get(
  '/themes',
  verifyToken,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('limit must be between 1 and 50')
  ],
  validate,
  insightController.getThemeBreakdown
);

/**
 * @route   GET /api/insights/survey-comparison
 * @desc    Get comparison data across all surveys
 * @access  Private
 */
router.get(
  '/survey-comparison',
  verifyToken,
  insightController.getSurveyComparison
);

/**
 * @route   GET /api/insights/trends
 * @desc    Get trend data formatted for charts
 * @access  Private
 * @query   weeks (default: 12)
 */
router.get(
  '/trends',
  verifyToken,
  [
    query('weeks')
      .optional()
      .isInt({ min: 1, max: 52 })
      .withMessage('weeks must be between 1 and 52')
  ],
  validate,
  insightController.getInsightTrends
);

/**
 * @route   GET /api/insights/:id
 * @desc    Get single insight by ID
 * @access  Private
 */
router.get(
  '/:id',
  verifyToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid insight ID is required')
  ],
  validate,
  insightController.getInsightById
);

/**
 * @route   POST /api/insights/generate
 * @desc    Manually generate insight for previous week (or specific week)
 * @access  Private
 * @body    weekStart (optional, YYYY-MM-DD)
 */
router.post(
  '/generate',
  verifyToken,
  [
    body('weekStart')
      .optional()
      .isISO8601()
      .withMessage('weekStart must be a valid date (YYYY-MM-DD)')
  ],
  validate,
  insightController.generateInsights
);

/**
 * @route   POST /api/insights/generate-all
 * @desc    Trigger insight generation for ALL businesses (admin)
 * @access  Private (should be admin only in production)
 */
router.post(
  '/generate-all',
  verifyToken,
  insightController.generateAllInsights
);

module.exports = router;
