// src/controllers/responseController.js
const Response = require('../models/Response');
const Answer = require('../models/Answer');
const Survey = require('../models/Survey');
const logger = require('../utils/logger');
const { getPagination } = require('../utils/helpers');

/**
 * Submit feedback (PUBLIC - no authentication required)
 * This is what customers use to submit their feedback
 * POST /api/responses/submit
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { survey_id, answers, device_type } = req.body;

    // Check if survey exists and is active
    const survey = await Survey.findById(survey_id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    if (!survey.is_active) {
      return res.status(400).json({
        success: false,
        error: 'This survey is no longer accepting responses'
      });
    }

    // Validate that answers is an array
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one answer'
      });
    }

    // Validate required questions are answered
    const requiredQuestions = survey.questions.filter(q => q.is_required);
    const answeredQuestionIds = answers.map(a => a.question_id);

    for (const question of requiredQuestions) {
      if (!answeredQuestionIds.includes(question.id)) {
        return res.status(400).json({
          success: false,
          error: `Question "${question.question_text}" is required`
        });
      }
    }

    // Create the response record
    const response = await Response.create({
      survey_id,
      business_id: survey.business_id,
      device_type: device_type || detectDeviceType(req)
    });

    // Prepare answers with question_text for historical accuracy
    const questionMap = {};
    survey.questions.forEach(q => {
      questionMap[q.id] = q;
    });

    const answersToCreate = answers.map(answer => {
      const question = questionMap[answer.question_id];
      const questionType = question?.question_type || 'text';
      
      return {
        response_id: response.id,
        question_id: answer.question_id,
        question_text: question?.question_text || 'Unknown question',
        answer_type: questionType,
        answer_text: questionType === 'text' ? (answer.answer_text || null) : null,
        answer_rating: questionType === 'rating' ? (answer.answer_rating || null) : null,
        answer_choice: questionType === 'mcq' ? (answer.answer_choice || null) : null
      };
    });

    // Create all answers
    const createdAnswers = await Answer.createMany(answersToCreate);

    logger.info(`Feedback submitted for survey ${survey_id}, response ID: ${response.id}`);

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        response_id: response.id,
        submitted_at: response.submitted_at
      }
    });
  } catch (error) {
    logger.error('Submit feedback error:', error);
    next(error);
  }
};

/**
 * Get all responses for a survey (PROTECTED)
 * GET /api/responses/survey/:surveyId
 */
const getResponsesBySurvey = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const businessId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    // Check if survey belongs to this business
    const survey = await Survey.findById(surveyId, businessId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    const { limit, offset } = getPagination(page, pageSize);
    const responses = await Response.findBySurveyId(surveyId, { limit, offset });
    const total = await Response.countBySurveyId(surveyId);

    res.status(200).json({
      success: true,
      data: {
        responses,
        pagination: {
          page,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get responses error:', error);
    next(error);
  }
};

/**
 * Get single response with all answers (PROTECTED)
 * GET /api/responses/:id
 */
const getResponseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    // Get response with answers
    const response = await Response.findByIdWithAnswers(id);

    if (!response) {
      return res.status(404).json({
        success: false,
        error: 'Response not found'
      });
    }

    // Check if this response belongs to a survey owned by this business
    if (response.business_id !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this response'
      });
    }

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Get response error:', error);
    next(error);
  }
};

/**
 * Delete a response (PROTECTED)
 * DELETE /api/responses/:id
 */
const deleteResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    // Check if response exists and belongs to this business
    const response = await Response.findById(id);

    if (!response) {
      return res.status(404).json({
        success: false,
        error: 'Response not found'
      });
    }

    if (response.business_id !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this response'
      });
    }

    await Response.delete(id);

    logger.info(`Response deleted: ${id} by business: ${businessId}`);

    res.status(200).json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    logger.error('Delete response error:', error);
    next(error);
  }
};

/**
 * Helper: Detect device type from user agent
 */
const detectDeviceType = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  
  if (/mobile/i.test(userAgent)) {
    return 'mobile';
  } else if (/tablet/i.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

module.exports = {
  submitFeedback,
  getResponsesBySurvey,
  getResponseById,
  deleteResponse
};
