const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const chatbotController = require('../controllers/chatbotController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { aiLimiter } = require('../middlewares/rateLimiter');

// All chatbot routes require authentication
router.use(verifyToken);

// Apply AI rate limiting (10 requests per minute) to all chatbot routes
router.use(aiLimiter);

/**
 * @route   POST /api/chatbot/message
 * @desc    Send a message to the AI chatbot
 * @access  Private
 */
router.post(
  '/message',
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 1000 })
      .withMessage('Message must be less than 1000 characters')
  ],
  validate,
  chatbotController.sendMessage
);

/**
 * @route   POST /api/chatbot/create-survey
 * @desc    Create a survey from chatbot-generated data
 * @access  Private
 */
router.post(
  '/create-survey',
  [
    body('surveyData')
      .isObject()
      .withMessage('Survey data is required'),
    body('surveyData.title')
      .trim()
      .notEmpty()
      .withMessage('Survey title is required'),
    body('surveyData.questions')
      .isArray({ min: 1 })
      .withMessage('At least one question is required')
  ],
  validate,
  chatbotController.createSurvey
);

/**
 * @route   GET /api/chatbot/history
 * @desc    Get conversation history
 * @access  Private
 */
router.get('/history', chatbotController.getHistory);

/**
 * @route   POST /api/chatbot/reset
 * @desc    Reset/clear conversation
 * @access  Private
 */
router.post('/reset', chatbotController.resetConversation);

/**
 * @route   GET /api/chatbot/suggestions
 * @desc    Get quick start suggestions based on industry
 * @access  Private
 */
router.get('/suggestions', chatbotController.getSuggestions);

/**
 * @route   POST /api/chatbot/generate-survey
 * @desc    Generate a complete survey from natural language description
 * @access  Private
 */
router.post(
  '/generate-survey',
  [
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('questionCount')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Question count must be between 1 and 10')
  ],
  validate,
  chatbotController.generateSurvey
);

/**
 * @route   POST /api/chatbot/refine-survey
 * @desc    Refine an existing survey based on feedback
 * @access  Private
 */
router.post(
  '/refine-survey',
  [
    body('surveyData')
      .isObject()
      .withMessage('Survey data is required'),
    body('surveyData.title')
      .trim()
      .notEmpty()
      .withMessage('Survey title is required'),
    body('surveyData.questions')
      .isArray({ min: 1 })
      .withMessage('At least one question is required'),
    body('feedback')
      .trim()
      .notEmpty()
      .withMessage('Feedback/refinement instructions are required')
      .isLength({ max: 1000 })
      .withMessage('Feedback must be less than 1000 characters')
  ],
  validate,
  chatbotController.refineSurvey
);

/**
 * @route   POST /api/chatbot/suggest-improvements
 * @desc    Get AI suggestions to improve an existing survey
 * @access  Private
 */
router.post(
  '/suggest-improvements',
  [
    body('surveyId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Valid survey ID is required'),
    body('surveyData')
      .optional()
      .isObject()
      .withMessage('Survey data must be an object')
  ],
  validate,
  chatbotController.suggestImprovements
);

module.exports = router;
