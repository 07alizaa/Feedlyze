// src/controllers/questionController.js
const Question = require('../models/Question');
const Survey = require('../models/Survey');
const logger = require('../utils/logger');
const { VALID_QUESTION_TYPES } = require('../utils/constants');

/**
 * Add question to survey
 * POST /api/questions
 */
const addQuestion = async (req, res, next) => {
  try {
    const { survey_id, question_text, question_type, options, is_required } = req.body;
    const businessId = req.userId;

    // Verify survey belongs to business
    const survey = await Survey.findById(survey_id, businessId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    // Validate question type
    if (!VALID_QUESTION_TYPES.includes(question_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid question type. Must be one of: ${VALID_QUESTION_TYPES.join(', ')}`
      });
    }

    // Validate MCQ has options
    if (question_type === 'mcq' && (!options || !Array.isArray(options) || options.length < 2)) {
      return res.status(400).json({
        success: false,
        error: 'Multiple choice questions must have at least 2 options'
      });
    }

    // Get next display order
    const display_order = await Question.getNextDisplayOrder(survey_id);

    // Create question
    const question = await Question.create({
      survey_id,
      question_text,
      question_type,
      options: question_type === 'mcq' ? options : null,
      is_required,
      display_order
    });

    logger.info(`Question added to survey ${survey_id}: ${question.id}`);

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: question
    });
  } catch (error) {
    logger.error('Add question error:', error);
    next(error);
  }
};

/**
 * Get all questions for a survey
 * GET /api/questions/survey/:surveyId
 */
const getQuestions = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const businessId = req.userId;

    // Verify survey belongs to business
    const survey = await Survey.findById(surveyId, businessId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    const questions = await Question.findBySurveyId(surveyId);

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    logger.error('Get questions error:', error);
    next(error);
  }
};

/**
 * Update question
 * PUT /api/questions/:id
 */
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question_text, question_type, options, is_required } = req.body;
    const businessId = req.userId;

    // Get question to verify ownership
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Verify survey belongs to business
    const survey = await Survey.findById(question.survey_id, businessId);

    if (!survey) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Validate question type if provided
    if (question_type && !VALID_QUESTION_TYPES.includes(question_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid question type. Must be one of: ${VALID_QUESTION_TYPES.join(', ')}`
      });
    }

    // Validate MCQ options if type is mcq
    if ((question_type === 'mcq' || question.question_type === 'mcq') && options) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Multiple choice questions must have at least 2 options'
        });
      }
    }

    // Update question
    const updatedQuestion = await Question.update(id, {
      question_text,
      question_type,
      options,
      is_required
    });

    logger.info(`Question updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    logger.error('Update question error:', error);
    next(error);
  }
};

/**
 * Delete question
 * DELETE /api/questions/:id
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    // Get question to verify ownership
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Verify survey belongs to business
    const survey = await Survey.findById(question.survey_id, businessId);

    if (!survey) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Delete question
    await Question.delete(id);

    logger.info(`Question deleted: ${id} from survey: ${question.survey_id}`);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    logger.error('Delete question error:', error);
    next(error);
  }
};

/**
 * Reorder questions (drag and drop support)
 * PATCH /api/questions/reorder
 */
const reorderQuestions = async (req, res, next) => {
  try {
    const { survey_id, questions } = req.body;
    const businessId = req.userId;

    // Validate input
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Questions array is required'
      });
    }

    // Verify survey belongs to business
    const survey = await Survey.findById(survey_id, businessId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    // Validate all questions belong to the survey
    for (const q of questions) {
      const belongs = await Question.belongsToSurvey(q.id, survey_id);
      if (!belongs) {
        return res.status(400).json({
          success: false,
          error: `Question ${q.id} does not belong to this survey`
        });
      }
    }

    // Reorder questions
    await Question.reorder(questions);

    logger.info(`Questions reordered for survey: ${survey_id}`);

    res.status(200).json({
      success: true,
      message: 'Questions reordered successfully'
    });
  } catch (error) {
    logger.error('Reorder questions error:', error);
    next(error);
  }
};

module.exports = {
  addQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  reorderQuestions
};