const ChatbotService = require('../services/chatbotService');
const Business = require('../models/Business');
const logger = require('../utils/logger');

/**
 * Send a message to the chatbot
 * POST /api/chatbot/message
 */
const sendMessage = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get business context for better responses
    const business = await Business.findById(businessId);
    const businessContext = {
      businessName: business?.business_name,
      industry: business?.industry
    };

    // Process message with AI
    const response = await ChatbotService.processMessage(
      businessId,
      message.trim(),
      businessContext
    );

    res.status(200).json({
      success: true,
      data: {
        message: response.message,
        hasSurveyData: !!response.surveyData,
        surveyData: response.surveyData || null
      }
    });

  } catch (error) {
    logger.error('Chatbot message error:', error);
    next(error);
  }
};

/**
 * Create survey from chatbot conversation
 * POST /api/chatbot/create-survey
 */
const createSurvey = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const { surveyData } = req.body;

    if (!surveyData || !surveyData.title || !surveyData.questions) {
      return res.status(400).json({
        success: false,
        error: 'Invalid survey data. Title and questions are required.'
      });
    }

    // Validate questions
    if (!Array.isArray(surveyData.questions) || surveyData.questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one question is required'
      });
    }

    // Validate each question
    for (const q of surveyData.questions) {
      if (!q.question_text || !q.question_type) {
        return res.status(400).json({
          success: false,
          error: 'Each question must have question_text and question_type'
        });
      }
      if (!['rating', 'text', 'mcq'].includes(q.question_type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid question type: ${q.question_type}. Must be rating, text, or mcq`
        });
      }
      if (q.question_type === 'mcq' && (!q.options || q.options.length < 2)) {
        return res.status(400).json({
          success: false,
          error: 'MCQ questions must have at least 2 options'
        });
      }
    }

    // Create the survey
    const survey = await ChatbotService.createSurveyFromChat(businessId, surveyData);

    res.status(201).json({
      success: true,
      message: 'Survey created successfully via chatbot!',
      data: survey
    });

  } catch (error) {
    logger.error('Chatbot create survey error:', error);
    next(error);
  }
};

/**
 * Get conversation history
 * GET /api/chatbot/history
 */
const getHistory = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const history = ChatbotService.getConversationHistory(businessId);

    res.status(200).json({
      success: true,
      data: {
        messages: history,
        count: history.length
      }
    });

  } catch (error) {
    logger.error('Get history error:', error);
    next(error);
  }
};

/**
 * Clear conversation and start fresh
 * POST /api/chatbot/reset
 */
const resetConversation = async (req, res, next) => {
  try {
    const businessId = req.userId;
    ChatbotService.clearConversation(businessId);

    res.status(200).json({
      success: true,
      message: 'Conversation reset successfully'
    });

  } catch (error) {
    logger.error('Reset conversation error:', error);
    next(error);
  }
};

/**
 * Get quick start suggestions
 * GET /api/chatbot/suggestions
 */
const getSuggestions = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const business = await Business.findById(businessId);
    
    const suggestions = ChatbotService.getSuggestions(business?.industry);

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        greeting: `Hi! I'm Feedlyze AI. I can help you create customer feedback surveys for ${business?.business_name || 'your business'}. What kind of feedback would you like to collect?`
      }
    });

  } catch (error) {
    logger.error('Get suggestions error:', error);
    next(error);
  }
};

module.exports = {
  sendMessage,
  createSurvey,
  getHistory,
  resetConversation,
  getSuggestions
};
