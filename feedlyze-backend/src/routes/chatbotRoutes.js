const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const chatbotController = require('../controllers/chatbotController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

// All chatbot routes require authentication
router.use(verifyToken);

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

module.exports = router;
