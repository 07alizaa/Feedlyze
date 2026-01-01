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
  getInsightTrends,
  getOverviewStats,
  getThemeBreakdown,
  getSurveyComparison
};

/**
 * Get overview statistics for dashboard cards
 * GET /api/insights/overview
 */
const getOverviewStats = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const Survey = require('../models/Survey');
    const Response = require('../models/Response');
    const AIAnalysis = require('../models/AIAnalysis');

    // Get survey count
    const surveys = await Survey.findByBusinessId(businessId, { limit: 1000, offset: 0 });
    const totalSurveys = surveys.length;
    const activeSurveys = surveys.filter(s => s.is_active).length;

    // Get total responses across all surveys
    const totalResponses = surveys.reduce((sum, s) => sum + (s.response_count || 0), 0);

    // Get sentiment breakdown for this business
    const sentimentStats = await AIAnalysis.getBusinessSentimentStats(businessId);

    // Get this week's data
    const InsightService = require('../services/insightService');
    const { startDate, endDate } = InsightService.getWeekBoundaries();
    const thisWeekStats = await Insight.getAggregatedStats(businessId, startDate, endDate);

    // Get previous week for comparison
    const { startDate: prevStart, endDate: prevEnd } = InsightService.getPreviousWeekBoundaries();
    const prevWeekStats = await Insight.getAggregatedStats(businessId, prevStart, prevEnd);

    const thisWeekResponses = parseInt(thisWeekStats?.total_responses) || 0;
    const prevWeekResponses = parseInt(prevWeekStats?.total_responses) || 0;
    const responseChange = prevWeekResponses > 0 
      ? (((thisWeekResponses - prevWeekResponses) / prevWeekResponses) * 100).toFixed(1)
      : null;

    res.status(200).json({
      success: true,
      data: {
        surveys: {
          total: totalSurveys,
          active: activeSurveys
        },
        responses: {
          total: totalResponses,
          thisWeek: thisWeekResponses,
          previousWeek: prevWeekResponses,
          percentChange: responseChange
        },
        sentiment: {
          total_analyzed: parseInt(sentimentStats?.total_analyzed) || 0,
          positive: parseInt(sentimentStats?.positive_count) || 0,
          neutral: parseInt(sentimentStats?.neutral_count) || 0,
          negative: parseInt(sentimentStats?.negative_count) || 0,
          averageScore: sentimentStats?.average_sentiment 
            ? parseFloat(sentimentStats.average_sentiment).toFixed(2) 
            : null
        }
      }
    });
  } catch (error) {
    logger.error('Get overview stats error:', error);
    next(error);
  }
};

/**
 * Get theme/entity breakdown for pie/bar charts
 * GET /api/insights/themes
 */
const getThemeBreakdown = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const { limit = 10 } = req.query;
    const AIAnalysis = require('../models/AIAnalysis');

    // Get all entities from analysis
    const entities = await AIAnalysis.getBusinessThemes(businessId, parseInt(limit));

    // Format for chart
    const chartData = {
      labels: entities.map(e => e.theme),
      data: entities.map(e => e.count),
      sentiments: entities.map(e => ({
        theme: e.theme,
        positive: e.positive_count || 0,
        negative: e.negative_count || 0,
        neutral: e.neutral_count || 0
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        themes: entities,
        chartData
      }
    });
  } catch (error) {
    logger.error('Get theme breakdown error:', error);
    next(error);
  }
};

/**
 * Get survey comparison data
 * GET /api/insights/survey-comparison
 */
const getSurveyComparison = async (req, res, next) => {
  try {
    const businessId = req.userId;
    const Survey = require('../models/Survey');
    const AIAnalysis = require('../models/AIAnalysis');

    // Get all surveys with their stats
    const surveys = await Survey.findByBusinessId(businessId, { limit: 20, offset: 0 });

    const comparisonData = await Promise.all(
      surveys.map(async (survey) => {
        const stats = await AIAnalysis.getSurveySentimentSummary(survey.id);
        return {
          id: survey.id,
          title: survey.title,
          responseCount: survey.response_count || 0,
          analyzedCount: parseInt(stats?.total_analyzed) || 0,
          positive: parseInt(stats?.positive_count) || 0,
          neutral: parseInt(stats?.neutral_count) || 0,
          negative: parseInt(stats?.negative_count) || 0,
          avgSentiment: stats?.average_sentiment 
            ? parseFloat(stats.average_sentiment).toFixed(2) 
            : null,
          isActive: survey.is_active,
          createdAt: survey.created_at
        };
      })
    );

    // Sort by response count descending
    comparisonData.sort((a, b) => b.responseCount - a.responseCount);

    res.status(200).json({
      success: true,
      data: {
        surveys: comparisonData,
        chartData: {
          labels: comparisonData.map(s => s.title.substring(0, 20)),
          responses: comparisonData.map(s => s.responseCount),
          positive: comparisonData.map(s => s.positive),
          negative: comparisonData.map(s => s.negative)
        }
      }
    });
  } catch (error) {
    logger.error('Get survey comparison error:', error);
    next(error);
  }
};
