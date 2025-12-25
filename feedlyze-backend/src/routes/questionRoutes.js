// src/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
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

// Add question validation
const addQuestionValidation = [
  body('survey_id').isInt().withMessage('Valid survey ID is required'),
  body('question_text').trim().notEmpty().withMessage('Question text is required'),
  body('question_type').isIn(['text', 'rating', 'mcq']).withMessage('Invalid question type'),
  body('options').optional().isArray({ min: 2 }).withMessage('MCQ must have at least 2 options'),
  body('is_required').optional().isBoolean().withMessage('is_required must be boolean'),
  validate
];

// Reorder questions validation
const reorderQuestionsValidation = [
  body('survey_id').isInt().withMessage('Valid survey ID is required'),
  body('questions').isArray({ min: 1 }).withMessage('Questions array is required'),
  body('questions.*.id').isInt().withMessage('Valid question ID is required'),
  body('questions.*.display_order').isInt().withMessage('Valid display order is required'),
  validate
];

/**
 * @route   POST /api/questions
 * @desc    Add question to survey
 * @access  Private
 */
router.post('/', verifyToken, addQuestionValidation, questionController.addQuestion);

/**
 * @route   GET /api/questions/survey/:surveyId
 * @desc    Get all questions for a survey
 * @access  Private
 */
router.get('/survey/:surveyId', verifyToken, questionController.getQuestions);

/**
 * @route   PUT /api/questions/:id
 * @desc    Update question
 * @access  Private
 */
router.put('/:id', verifyToken, questionController.updateQuestion);

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete question
 * @access  Private
 */
router.delete('/:id', verifyToken, questionController.deleteQuestion);

/**
 * @route   PATCH /api/questions/reorder
 * @desc    Reorder questions (for drag-and-drop)
 * @access  Private
 */
router.patch('/reorder', verifyToken, reorderQuestionsValidation, questionController.reorderQuestions);

module.exports = router;