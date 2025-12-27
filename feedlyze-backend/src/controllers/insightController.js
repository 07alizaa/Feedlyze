// src/controllers/insightController.js
const Insight = require('../models/Insight');
const InsightService = require('../services/insightService');
const { runInsightJob } = require('../jobs/weeklyInsightJob');
const logger = require('../utils/logger');

/**
 * Get weekly insights for logged-in business
 * GET /api/insights/weekly
 * Query params: startDate, endDate, limit
 */
const getWeeklyInsights = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const { startDate, endDate, limit } = req.query;

    const insights = await Insight.findByBusinessId(businessId, {
      startDate,
      endDate,
      limit: parseInt(limit) || 12
    });

    res.status(200).json({
      success: true,
      data: {
        insights,
        count: insights.length
      }
    });
  } catch (error) {
    logger.error('Get weekly insights error:', error);
    next(error);
  }
};

/**
 * Get dashboard summary with trends
 * GET /api/insights/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const businessId = req.userId;

    const dashboard = await InsightService.getDashboardSummary(businessId);

    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.error('Get dashboard error:', error);
    next(error);
  }
};

/**
 * Get single insight by ID
 * GET /api/insights/:id
 */
const getInsightById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.userId;

    const insight = await Insight.findById(id);

    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }

    // Verify ownership
    if (insight.business_id !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: insight
    });
  } catch (error) {
    logger.error('Get insight by ID error:', error);
    next(error);
  }
};

/**
 * Manually trigger insight generation for previous week
 * POST /api/insights/generate
 * This is an admin/manual trigger
 */
const generateInsights = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const { weekStart } = req.body || {};

    let startDate, endDate;

    if (weekStart) {
      // Generate for specific week
      const weekBoundaries = InsightService.getWeekBoundaries(new Date(weekStart));
      startDate = weekBoundaries.startDate;
      endDate = weekBoundaries.endDate;
    } else {
      // Generate for previous week
      const prevWeek = InsightService.getPreviousWeekBoundaries();
      startDate = prevWeek.startDate;
      endDate = prevWeek.endDate;
    }

    const result = await InsightService.generateInsightForBusiness(
      businessId,
      startDate,
      endDate
    );

    if (result.skipped) {
      return res.status(200).json({
        success: true,
        message: `Insight already exists for week ${startDate}`,
        data: { skipped: true, weekStart: startDate }
      });
    }

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    logger.info(`Manual insight generation for business ${businessId}, week ${startDate}`);

    res.status(201).json({
      success: true,
      message: 'Insight generated successfully',
      data: result.insight
    });
  } catch (error) {
    logger.error('Generate insights error:', error);
    next(error);
  }
};

/**
 * Trigger insight generation for ALL businesses (admin only)
 * POST /api/insights/generate-all
 */
const generateAllInsights = async (req, res, next) => {
  try {
    // Note: In production, add admin role check here
    
    logger.info('Manual trigger: Generating insights for all businesses');

    const results = await runInsightJob();

    res.status(200).json({
      success: true,
      message: 'Insight generation complete',
      data: results
    });
  } catch (error) {
    logger.error('Generate all insights error:', error);
    next(error);
  }
};

/**
 * Get insight trend data for charts
 * GET /api/insights/trends
 */
const getInsightTrends = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const { weeks = 12 } = req.query;

    const insights = await Insight.findByBusinessId(businessId, {
      limit: parseInt(weeks)
    });

    // Format data for charts
    const trendData = {
      labels: insights.map(i => i.week_start_date).reverse(),
      datasets: {
        responses: insights.map(i => i.total_responses).reverse(),
        sentiment: insights.map(i => parseFloat(i.avg_sentiment_score) || 0).reverse(),
        positive: insights.map(i => i.positive_count).reverse(),
        neutral: insights.map(i => i.neutral_count).reverse(),
        negative: insights.map(i => i.negative_count).reverse()
      }
    };

    res.status(200).json({
      success: true,
      data: trendData
    });
  } catch (error) {
    logger.error('Get insight trends error:', error);
    next(error);
  }
};

module.exports = {
  getWeeklyInsights,
  getDashboard,
  getInsightById,
  generateInsights,
  generateAllInsights,
  getInsightTrends
};
