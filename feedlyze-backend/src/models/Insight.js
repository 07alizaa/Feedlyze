// src/models/Insight.js
const { query } = require('../config/database');

class Insight {
  /**
   * Create a new weekly insight record
   */
  static async create({
    business_id,
    week_start_date,
    week_end_date,
    total_responses,
    positive_count,
    neutral_count,
    negative_count,
    avg_sentiment_score,
    top_themes
  }) {
    const sql = `
      INSERT INTO insights (
        business_id, week_start_date, week_end_date,
        total_responses, positive_count, neutral_count, negative_count,
        avg_sentiment_score, top_themes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      business_id,
      week_start_date,
      week_end_date,
      total_responses,
      positive_count,
      neutral_count,
      negative_count,
      avg_sentiment_score,
      top_themes ? JSON.stringify(top_themes) : null
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Check if insight already exists for a week
   */
  static async existsForWeek(businessId, weekStartDate) {
    const sql = `
      SELECT id FROM insights 
      WHERE business_id = $1 AND week_start_date = $2
    `;
    const result = await query(sql, [businessId, weekStartDate]);
    return result.rows.length > 0;
  }

  /**
   * Update existing insight
   */
  static async update(id, {
    total_responses,
    positive_count,
    neutral_count,
    negative_count,
    avg_sentiment_score,
    top_themes
  }) {
    const sql = `
      UPDATE insights
      SET 
        total_responses = $1,
        positive_count = $2,
        neutral_count = $3,
        negative_count = $4,
        avg_sentiment_score = $5,
        top_themes = $6,
        generated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      total_responses,
      positive_count,
      neutral_count,
      negative_count,
      avg_sentiment_score,
      top_themes ? JSON.stringify(top_themes) : null,
      id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Get insights for a business within date range
   */
  static async findByBusinessId(businessId, { startDate, endDate, limit = 12 } = {}) {
    let sql = `
      SELECT * FROM insights
      WHERE business_id = $1
    `;
    const values = [businessId];

    if (startDate) {
      sql += ` AND week_start_date >= $${values.length + 1}`;
      values.push(startDate);
    }

    if (endDate) {
      sql += ` AND week_end_date <= $${values.length + 1}`;
      values.push(endDate);
    }

    sql += ` ORDER BY week_start_date DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const result = await query(sql, values);
    return result.rows;
  }

  /**
   * Get latest insight for a business
   */
  static async findLatest(businessId) {
    const sql = `
      SELECT * FROM insights
      WHERE business_id = $1
      ORDER BY week_start_date DESC
      LIMIT 1
    `;

    const result = await query(sql, [businessId]);
    return result.rows[0] || null;
  }

  /**
   * Get insight by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM insights WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all businesses (for batch processing)
   */
  static async getAllBusinessIds() {
    const sql = `SELECT id FROM businesses`;
    const result = await query(sql);
    return result.rows.map(row => row.id);
  }

  /**
   * Get aggregated stats for a business within date range
   */
  static async getAggregatedStats(businessId, startDate, endDate) {
    const sql = `
      SELECT 
        COUNT(r.id) as total_responses,
        COUNT(CASE WHEN a.sentiment_label = 'POSITIVE' THEN 1 END) as positive_count,
        COUNT(CASE WHEN a.sentiment_label = 'NEUTRAL' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN a.sentiment_label = 'NEGATIVE' THEN 1 END) as negative_count,
        AVG(a.sentiment_score) as avg_sentiment_score
      FROM responses r
      LEFT JOIN ai_analysis a ON r.id = a.response_id
      WHERE r.business_id = $1
        AND r.submitted_at >= $2
        AND r.submitted_at < $3
    `;

    const result = await query(sql, [businessId, startDate, endDate]);
    return result.rows[0];
  }

  /**
   * Get all entities/themes for a business within date range
   */
  static async getThemesForPeriod(businessId, startDate, endDate) {
    const sql = `
      SELECT a.entities
      FROM ai_analysis a
      JOIN responses r ON a.response_id = r.id
      WHERE r.business_id = $1
        AND r.submitted_at >= $2
        AND r.submitted_at < $3
        AND a.entities IS NOT NULL
    `;

    const result = await query(sql, [businessId, startDate, endDate]);
    return result.rows;
  }

  /**
   * Delete old insights (older than 1 year)
   */
  static async deleteOldInsights(monthsToKeep = 12) {
    const sql = `
      DELETE FROM insights
      WHERE week_end_date < NOW() - INTERVAL '${monthsToKeep} months'
      RETURNING id
    `;

    const result = await query(sql);
    return result.rowCount;
  }
}

module.exports = Insight;
