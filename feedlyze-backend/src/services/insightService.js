// src/services/insightService.js
const Insight = require('../models/Insight');
const logger = require('../utils/logger');

class InsightService {
  /**
   * Get week boundaries (Monday to Sunday)
   * @param {Date} date - Any date within the week
   * @returns {Object} - { startDate, endDate }
   */
  static getWeekBoundaries(date = new Date()) {
    const current = new Date(date);
    
    // Get Monday of this week
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    
    const startDate = new Date(current.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)
    };
  }

  /**
   * Get previous week boundaries
   */
  static getPreviousWeekBoundaries() {
    const now = new Date();
    now.setDate(now.getDate() - 7);
    return this.getWeekBoundaries(now);
  }

  /**
   * Format date to YYYY-MM-DD
   */
  static formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Extract and aggregate top themes from entities
   * @param {Array} analysisRows - Rows with entities JSONB
   * @returns {Array} - Sorted array of { theme, count, avgSentiment }
   */
  static aggregateThemes(analysisRows) {
    const themeMap = new Map();

    for (const row of analysisRows) {
      if (!row.entities || !Array.isArray(row.entities)) continue;

      for (const entity of row.entities) {
        const theme = entity.theme?.toLowerCase();
        if (!theme) continue;

        if (!themeMap.has(theme)) {
          themeMap.set(theme, {
            theme,
            count: 0,
            sentimentSum: 0,
            sentiments: []
          });
        }

        const themeData = themeMap.get(theme);
        themeData.count++;
        
        // Map sentiment label to score for averaging
        const sentimentScore = entity.sentiment === 'POSITIVE' ? 1 :
                              entity.sentiment === 'NEGATIVE' ? -1 : 0;
        themeData.sentimentSum += sentimentScore;
        themeData.sentiments.push(entity.sentiment);
      }
    }

    // Convert to array and calculate averages
    const themes = Array.from(themeMap.values()).map(t => ({
      theme: t.theme,
      count: t.count,
      avgSentiment: t.count > 0 ? (t.sentimentSum / t.count).toFixed(2) : 0,
      dominantSentiment: this.getDominantSentiment(t.sentiments)
    }));

    // Sort by count descending, take top 10
    return themes
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get the most common sentiment from an array
   */
  static getDominantSentiment(sentiments) {
    const counts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
    
    for (const s of sentiments) {
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    }

    if (counts.POSITIVE >= counts.NEUTRAL && counts.POSITIVE >= counts.NEGATIVE) {
      return 'POSITIVE';
    } else if (counts.NEGATIVE >= counts.NEUTRAL) {
      return 'NEGATIVE';
    }
    return 'NEUTRAL';
  }

  /**
   * Generate insight for a specific business and week
   */
  static async generateInsightForBusiness(businessId, weekStart, weekEnd) {
    try {
      // Check if insight already exists
      const exists = await Insight.existsForWeek(businessId, weekStart);
      
      if (exists) {
        logger.info(`Insight already exists for business ${businessId}, week ${weekStart}`);
        return { skipped: true, businessId, weekStart };
      }

      // Get aggregated stats
      const stats = await Insight.getAggregatedStats(businessId, weekStart, weekEnd);

      // Get themes
      const themeRows = await Insight.getThemesForPeriod(businessId, weekStart, weekEnd);
      const topThemes = this.aggregateThemes(themeRows);

      // Create insight record
      const insight = await Insight.create({
        business_id: businessId,
        week_start_date: weekStart,
        week_end_date: weekEnd,
        total_responses: parseInt(stats.total_responses) || 0,
        positive_count: parseInt(stats.positive_count) || 0,
        neutral_count: parseInt(stats.neutral_count) || 0,
        negative_count: parseInt(stats.negative_count) || 0,
        avg_sentiment_score: stats.avg_sentiment_score ? 
          parseFloat(stats.avg_sentiment_score).toFixed(2) : null,
        top_themes: topThemes
      });

      logger.info(`Generated insight for business ${businessId}, week ${weekStart}: ${stats.total_responses} responses`);

      return { success: true, insight };
    } catch (error) {
      logger.error(`Error generating insight for business ${businessId}:`, error);
      return { error: error.message, businessId };
    }
  }

  /**
   * Generate insights for all businesses for previous week
   */
  static async generateWeeklyInsightsForAllBusinesses() {
    const { startDate, endDate } = this.getPreviousWeekBoundaries();
    
    logger.info(`Generating weekly insights for ${startDate} to ${endDate}`);

    const businessIds = await Insight.getAllBusinessIds();
    const results = {
      total: businessIds.length,
      success: 0,
      skipped: 0,
      errors: []
    };

    for (const businessId of businessIds) {
      const result = await this.generateInsightForBusiness(businessId, startDate, endDate);
      
      if (result.success) {
        results.success++;
      } else if (result.skipped) {
        results.skipped++;
      } else if (result.error) {
        results.errors.push({ businessId, error: result.error });
      }
    }

    logger.info(`Weekly insight generation complete: ${results.success} created, ${results.skipped} skipped, ${results.errors.length} errors`);

    return results;
  }

  /**
   * Get dashboard summary for a business
   */
  static async getDashboardSummary(businessId) {
    // Get latest insight
    const latestInsight = await Insight.findLatest(businessId);

    // Get last 12 weeks of insights for trend
    const weeklyInsights = await Insight.findByBusinessId(businessId, { limit: 12 });

    // Calculate trends (compare last 2 weeks)
    let trends = null;
    if (weeklyInsights.length >= 2) {
      const current = weeklyInsights[0];
      const previous = weeklyInsights[1];

      trends = {
        responses: {
          current: current.total_responses,
          previous: previous.total_responses,
          change: current.total_responses - previous.total_responses,
          percentChange: previous.total_responses > 0 
            ? ((current.total_responses - previous.total_responses) / previous.total_responses * 100).toFixed(1)
            : null
        },
        sentiment: {
          current: parseFloat(current.avg_sentiment_score) || 0,
          previous: parseFloat(previous.avg_sentiment_score) || 0,
          change: (parseFloat(current.avg_sentiment_score) || 0) - (parseFloat(previous.avg_sentiment_score) || 0)
        },
        positiveRate: {
          current: current.total_responses > 0 
            ? (current.positive_count / current.total_responses * 100).toFixed(1) : 0,
          previous: previous.total_responses > 0 
            ? (previous.positive_count / previous.total_responses * 100).toFixed(1) : 0
        }
      };
    }

    // Aggregate all-time themes
    const allThemes = new Map();
    for (const insight of weeklyInsights) {
      if (insight.top_themes && Array.isArray(insight.top_themes)) {
        for (const theme of insight.top_themes) {
          const existing = allThemes.get(theme.theme) || { count: 0 };
          allThemes.set(theme.theme, {
            theme: theme.theme,
            count: existing.count + theme.count,
            dominantSentiment: theme.dominantSentiment
          });
        }
      }
    }

    const aggregatedThemes = Array.from(allThemes.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      currentWeek: latestInsight || null,
      weeklyTrend: weeklyInsights.map(w => ({
        week: w.week_start_date,
        responses: w.total_responses,
        sentiment: parseFloat(w.avg_sentiment_score) || 0,
        positive: w.positive_count,
        neutral: w.neutral_count,
        negative: w.negative_count
      })),
      trends,
      topThemes: aggregatedThemes
    };
  }
}

module.exports = InsightService;
