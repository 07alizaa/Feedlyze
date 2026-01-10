// src/controllers/surveyController.js
const Survey = require('../models/Survey');
const Question = require('../models/Question');
const QRService = require('../services/qrService');
const logger = require('../utils/logger');
const { getPagination } = require('../utils/helpers');

/**
 * Create new survey with questions
 * POST /api/surveys/create
 */
const createSurvey = async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;
    const businessId = req.userId;

    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one question is required'
      });
    }

    // Create survey first (without QR code)
    const survey = await Survey.create({
      business_id: businessId,
      title,
      description,
      qr_code_url: null
    });

    // Generate QR code
    const qrCode = await QRService.generateSurveyQR(survey.short_code);

    // Update survey with QR code
    await Survey.update(survey.id, businessId, { qr_code_url: qrCode });

    // Create questions
    const createdQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      const createdQuestion = await Question.create({
        survey_id: survey.id,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        is_required: question.is_required !== false,
        display_order: i + 1
      });

      createdQuestions.push(createdQuestion);
    }

    logger.info(`Survey created: ${survey.id} by business: ${businessId}`);

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: {
        ...survey,
        qr_code_url: qrCode,
        questions: createdQuestions,
        public_url: QRService.getSurveyURL(survey.short_code)
      }
    });
  } catch (error) {
    logger.error('Create survey error:', error);
    next(error);
  }
};

/**
 * Get all surveys for logged-in business
 * GET /api/surveys
 */
const getSurveys = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const { limit, offset } = getPagination(page, pageSize);

    const surveys = await Survey.findByBusinessId(businessId, { limit, offset });

    // Add public_url to each survey
    const surveysWithUrls = surveys.map(survey => ({
      ...survey,
      public_url: QRService.getSurveyURL(survey.short_code)
    }));

    res.status(200).json({
      success: true,
      data: {
        surveys: surveysWithUrls,
        pagination: {
          page,
          pageSize: limit,
          total: surveys.length
        }
      }
    });
  } catch (error) {
    logger.error('Get surveys error:', error);
    next(error);
  }
};

/**
 * Get single survey by ID (with questions)
 * GET /api/surveys/:id
 */
const getSurveyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    const survey = await Survey.findById(id, businessId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    // Get survey statistics
    const stats = await Survey.getStats(id);

    res.status(200).json({
      success: true,
      data: {
        ...survey,
        stats,
        public_url: QRService.getSurveyURL(survey.short_code)
      }
    });
  } catch (error) {
    logger.error('Get survey error:', error);
    next(error);
  }
};

/**
 * Get public survey by short code (no authentication)
 * GET /api/surveys/public/:shortCode
 */
const getPublicSurvey = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const survey = await Survey.findByShortCode(shortCode);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found or inactive'
      });
    }

    // Don't send sensitive business information
    const publicSurvey = {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions
    };

    res.status(200).json({
      success: true,
      data: publicSurvey
    });
  } catch (error) {
    logger.error('Get public survey error:', error);
    next(error);
  }
};

/**
 * Update survey
 * PUT /api/surveys/:id
 */
const updateSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, is_active } = req.body;
    const businessId = req.userId;

    const updatedSurvey = await Survey.update(id, businessId, {
      title,
      description,
      is_active
    });

    if (!updatedSurvey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    logger.info(`Survey updated: ${id} by business: ${businessId}`);

    res.status(200).json({
      success: true,
      message: 'Survey updated successfully',
      data: updatedSurvey
    });
  } catch (error) {
    logger.error('Update survey error:', error);
    next(error);
  }
};

/**
 * Toggle survey active status
 * PATCH /api/surveys/:id/toggle
 */
const toggleSurveyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    const survey = await Survey.toggleActive(id, businessId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    logger.info(`Survey status toggled: ${id} - Active: ${survey.is_active}`);

    res.status(200).json({
      success: true,
      message: `Survey ${survey.is_active ? 'activated' : 'deactivated'} successfully`,
      data: survey
    });
  } catch (error) {
    logger.error('Toggle survey status error:', error);
    next(error);
  }
};

/**
 * Delete survey
 * DELETE /api/surveys/:id
 */
const deleteSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    const deleted = await Survey.delete(id, businessId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    logger.info(`Survey deleted: ${id} by business: ${businessId}`);

    res.status(200).json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    logger.error('Delete survey error:', error);
    next(error);
  }
};

/**
 * Regenerate QR code for survey
 * POST /api/surveys/:id/regenerate-qr
 */
const regenerateQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    const survey = await Survey.findById(id, businessId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    // Generate new QR code
    const qrCode = await QRService.generateSurveyQR(survey.short_code);

    // Update survey with new QR code
    const updatedSurvey = await Survey.update(id, businessId, {
      qr_code_url: qrCode
    });

    logger.info(`QR code regenerated for survey: ${id}`);

    res.status(200).json({
      success: true,
      message: 'QR code regenerated successfully',
      data: {
        qr_code_url: qrCode,
        public_url: QRService.getSurveyURL(survey.short_code)
      }
    });
  } catch (error) {
    logger.error('Regenerate QR error:', error);
    next(error);
  }
};

module.exports = {
  createSurvey,
  getSurveys,
  getSurveyById,
  getPublicSurvey,
  updateSurvey,
  toggleSurveyStatus,
  deleteSurvey,
  regenerateQR
};