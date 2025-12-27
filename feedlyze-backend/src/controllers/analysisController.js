// src/controllers/analysisController.js
const AIAnalysis = require('../models/AIAnalysis');
const Response = require('../models/Response');
const Answer = require('../models/Answer');
const Survey = require('../models/Survey');
const AnalysisService = require('../services/analysisService');
const logger = require('../utils/logger');

/**
 * Analyze a single response
 * POST /api/analysis/response/:id
 */
const analyzeResponse = async (req, res, next) => {
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

    // Verify business ownership
    if (response.business_id !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Check if already analyzed
    const existingAnalysis = await AIAnalysis.findByResponseId(id);
    if (existingAnalysis) {
      return res.status(200).json({
        success: true,
        message: 'Response already analyzed',
        data: existingAnalysis
      });
    }

    // Perform analysis (now async with Gemini AI)
    const textAnalysis = await AnalysisService.analyzeResponse(response.answers);
    const ratingAnalysis = AnalysisService.analyzeRatings(response.answers);

    // Create analysis record
    const analysis = await AIAnalysis.create({
      response_id: id,
      business_id: response.business_id,
      sentiment_score: textAnalysis.score,
      sentiment_label: textAnalysis.label,
      entities: textAnalysis.entities
    });

    // Mark response as analyzed
    await Response.markAsAnalyzed(id);

    logger.info(`Response ${id} analyzed: ${textAnalysis.label}`);

    res.status(201).json({
      success: true,
      message: 'Analysis complete',
      data: {
        ...analysis,
        rating_analysis: ratingAnalysis
      }
    });
  } catch (error) {
    logger.error('Analyze response error:', error);
    next(error);
  }
};

/**
 * Analyze all unanalyzed responses for a survey
 * POST /api/analysis/survey/:surveyId
 */
const analyzeSurvey = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const businessId = req.userId;

    // Verify survey ownership
    const survey = await Survey.findById(surveyId, businessId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    // Get unanalyzed responses
    const unanalyzed = await AIAnalysis.getUnanalyzedResponses(surveyId);

    if (unanalyzed.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All responses already analyzed',
        data: { analyzed_count: 0 }
      });
    }

    // Analyze each response
    let analyzedCount = 0;
    for (const resp of unanalyzed) {
      const responseWithAnswers = await Response.findByIdWithAnswers(resp.id);
      
      if (responseWithAnswers && responseWithAnswers.answers.length > 0) {
        const textAnalysis = await AnalysisService.analyzeResponse(responseWithAnswers.answers);

        await AIAnalysis.create({
          response_id: resp.id,
          business_id: resp.business_id,
          sentiment_score: textAnalysis.score,
          sentiment_label: textAnalysis.label,
          entities: textAnalysis.entities
        });

        await Response.markAsAnalyzed(resp.id);
        analyzedCount++;
      }
    }

    logger.info(`Survey ${surveyId}: ${analyzedCount} responses analyzed`);

    res.status(200).json({
      success: true,
      message: `${analyzedCount} responses analyzed`,
      data: { analyzed_count: analyzedCount }
    });
  } catch (error) {
    logger.error('Analyze survey error:', error);
    next(error);
  }
};

/**
 * Get sentiment summary for a survey
 * GET /api/analysis/survey/:surveyId/summary
 */
const getSurveySentimentSummary = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const businessId = req.userId;

    // Verify survey ownership
    const survey = await Survey.findById(surveyId, businessId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    // Get sentiment summary
    const summary = await AIAnalysis.getSurveySentimentSummary(surveyId);

    // Get rating distribution
    const answers = await Answer.findByQuestionId(survey.questions[0]?.id || 0);
    const ratingAnswers = answers.filter(a => a.answer_rating !== null);
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingAnswers.forEach(a => {
      if (ratingDistribution[a.answer_rating] !== undefined) {
        ratingDistribution[a.answer_rating]++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        survey_id: parseInt(surveyId),
        survey_title: survey.title,
        total_responses: survey.response_count || 0,
        sentiment: {
          total_analyzed: parseInt(summary.total_analyzed) || 0,
          positive_count: parseInt(summary.positive_count) || 0,
          neutral_count: parseInt(summary.neutral_count) || 0,
          negative_count: parseInt(summary.negative_count) || 0,
          average_score: summary.average_sentiment ? parseFloat(summary.average_sentiment).toFixed(2) : null
        },
        rating_distribution: ratingDistribution
      }
    });
  } catch (error) {
    logger.error('Get sentiment summary error:', error);
    next(error);
  }
};

/**
 * Get analysis for a specific response
 * GET /api/analysis/response/:id
 */
const getResponseAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    // Get response to verify ownership
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
        error: 'Unauthorized'
      });
    }

    // Get analysis
    const analysis = await AIAnalysis.findByResponseId(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found. Run POST /api/analysis/response/:id first'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Get response analysis error:', error);
    next(error);
  }
};

module.exports = {
  analyzeResponse,
  analyzeSurvey,
  getSurveySentimentSummary,
  getResponseAnalysis
};
