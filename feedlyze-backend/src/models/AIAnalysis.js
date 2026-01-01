// src/models/AIAnalysis.js
const { query, getClient } = require('../config/database');

class AIAnalysis {
  /**
   * Create analysis record for a response
   */
  static async create({ response_id, business_id, sentiment_score, sentiment_label, entities }) {
    const sql = `
      INSERT INTO ai_analysis (response_id, business_id, sentiment_score, sentiment_label, entities)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      response_id,
      business_id,
      sentiment_score,
      sentiment_label,
      entities ? JSON.stringify(entities) : null
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Get analysis by response ID
   */
  static async findByResponseId(responseId) {
    const sql = `SELECT * FROM ai_analysis WHERE response_id = $1`;
    const result = await query(sql, [responseId]);
    return result.rows[0] || null;
  }

  /**
   * Get all analyses for a survey
   */
  static async findBySurveyId(surveyId) {
    const sql = `
      SELECT a.*, r.submitted_at
      FROM ai_analysis a
      JOIN responses r ON a.response_id = r.id
      WHERE r.survey_id = $1
      ORDER BY r.submitted_at DESC
    `;

    const result = await query(sql, [surveyId]);
    return result.rows;
  }

  /**
   * Get survey sentiment summary
   */
  static async getSurveySentimentSummary(surveyId) {
    const sql = `
      SELECT 
        COUNT(*) as total_analyzed,
        COUNT(CASE WHEN sentiment_label = 'POSITIVE' THEN 1 END) as positive_count,
        COUNT(CASE WHEN sentiment_label = 'NEUTRAL' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN sentiment_label = 'NEGATIVE' THEN 1 END) as negative_count,
        AVG(sentiment_score) as average_sentiment
      FROM ai_analysis a
      JOIN responses r ON a.response_id = r.id
      WHERE r.survey_id = $1
    `;

    const result = await query(sql, [surveyId]);
    return result.rows[0];
  }

  /**
   * Check if response has been analyzed
   */
  static async exists(responseId) {
    const sql = `SELECT id FROM ai_analysis WHERE response_id = $1`;
    const result = await query(sql, [responseId]);
    return result.rows.length > 0;
  }

  /**
   * Get unanalyzed responses for a survey
   */
  static async getUnanalyzedResponses(surveyId) {
    const sql = `
      SELECT r.id, r.survey_id, r.business_id, r.submitted_at
      FROM responses r
      LEFT JOIN ai_analysis a ON r.id = a.response_id
      WHERE r.survey_id = $1 AND a.id IS NULL AND r.ai_analyzed = false
      ORDER BY r.submitted_at ASC
    `;

    const result = await query(sql, [surveyId]);
    return result.rows;
  }

  /**
   * Get sentiment statistics for a business (all surveys)
   */
  static async getBusinessSentimentStats(businessId) {
    const sql = `
      SELECT 
        COUNT(*) as total_analyzed,
        COUNT(CASE WHEN sentiment_label = 'POSITIVE' THEN 1 END) as positive_count,
        COUNT(CASE WHEN sentiment_label = 'NEUTRAL' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN sentiment_label = 'NEGATIVE' THEN 1 END) as negative_count,
        AVG(sentiment_score) as average_sentiment
      FROM ai_analysis
      WHERE business_id = $1
    `;

    const result = await query(sql, [businessId]);
    return result.rows[0];
  }

  /**
   * Get theme/entity breakdown for a business (aggregated from entities JSONB)
   */
  static async getBusinessThemes(businessId, limit = 10) {
    // This query extracts themes from the entities JSONB array
    const sql = `
      WITH theme_data AS (
        SELECT 
          jsonb_array_elements(entities)->>'theme' as theme,
          jsonb_array_elements(entities)->>'sentiment' as sentiment
        FROM ai_analysis
        WHERE business_id = $1 AND entities IS NOT NULL
      )
      SELECT 
        theme,
        COUNT(*) as count,
        COUNT(CASE WHEN sentiment = 'POSITIVE' THEN 1 END) as positive_count,
        COUNT(CASE WHEN sentiment = 'NEUTRAL' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN sentiment = 'NEGATIVE' THEN 1 END) as negative_count
      FROM theme_data
      WHERE theme IS NOT NULL
      GROUP BY theme
      ORDER BY count DESC
      LIMIT $2
    `;

    const result = await query(sql, [businessId, limit]);
    return result.rows;
  }

  /**
   * Get recent analyses with response details
   */
  static async getRecentAnalyses(businessId, limit = 10) {
    const sql = `
      SELECT 
        a.*,
        r.submitted_at,
        r.device_type,
        s.title as survey_title
      FROM ai_analysis a
      JOIN responses r ON a.response_id = r.id
      JOIN surveys s ON r.survey_id = s.id
      WHERE a.business_id = $1
      ORDER BY a.analyzed_at DESC
      LIMIT $2
    `;

    const result = await query(sql, [businessId, limit]);
    return result.rows;
  }
}

module.exports = AIAnalysis;
