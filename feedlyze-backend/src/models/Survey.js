// src/models/Survey.js
const { query, getClient } = require('../config/database');
const { generateUniqueShortCode } = require('../utils/helpers');

class Survey {
  /**
   * Check if short code exists
   */
  static async shortCodeExists(shortCode) {
    const sql = `SELECT id FROM surveys WHERE short_code = $1`;
    const result = await query(sql, [shortCode]);
    return result.rows.length > 0;
  }

  /**
   * Create a new survey
   * @param {Object} surveyData
   * @returns {Promise<Object>}
   */
  static async create({ business_id, title, description, qr_code_url }) {
    // Generate unique short code
    const short_code = await generateUniqueShortCode(this.shortCodeExists);

    const sql = `
      INSERT INTO surveys (business_id, title, description, qr_code_url, short_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, business_id, title, description, is_active, qr_code_url, 
                short_code, response_count, created_at
    `;

    const values = [business_id, title, description, qr_code_url, short_code];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Get all surveys for a business
   */
  static async findByBusinessId(businessId, { limit = 20, offset = 0 } = {}) {
    const sql = `
      SELECT 
        s.*,
        COUNT(q.id) as question_count
      FROM surveys s
      LEFT JOIN questions q ON s.id = q.survey_id
      WHERE s.business_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [businessId, limit, offset]);
    return result.rows;
  }

  /**
   * Get survey by ID (with questions)
   */
  static async findById(id, businessId = null) {
    let sql = `
      SELECT 
        s.*,
        COUNT(r.id) as response_count_actual
      FROM surveys s
      LEFT JOIN responses r ON s.id = r.survey_id
      WHERE s.id = $1
    `;
    
    const values = [id];

    if (businessId) {
      sql += ` AND s.business_id = $2`;
      values.push(businessId);
    }

    sql += ` GROUP BY s.id`;

    const result = await query(sql, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const survey = result.rows[0];

    // Get questions for this survey
    const questions = await query(
      `SELECT * FROM questions WHERE survey_id = $1 ORDER BY display_order ASC`,
      [id]
    );

    survey.questions = questions.rows;

    return survey;
  }

  /**
   * Get survey by short code (public access)
   */
  static async findByShortCode(shortCode) {
    const sql = `
      SELECT * FROM surveys WHERE short_code = $1 AND is_active = true
    `;

    const result = await query(sql, [shortCode]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const survey = result.rows[0];

    // Get questions
    const questions = await query(
      `SELECT id, question_text, question_type, options, is_required, display_order 
       FROM questions 
       WHERE survey_id = $1 
       ORDER BY display_order ASC`,
      [survey.id]
    );

    survey.questions = questions.rows;

    return survey;
  }

  /**
   * Update survey
   */
  static async update(id, businessId, { title, description, is_active, qr_code_url }) {
    const sql = `
      UPDATE surveys
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active),
        qr_code_url = COALESCE($4, qr_code_url)
      WHERE id = $5 AND business_id = $6
      RETURNING *
    `;

    const values = [title, description, is_active, qr_code_url, id, businessId];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Toggle survey active status
   */
  static async toggleActive(id, businessId) {
    const sql = `
      UPDATE surveys
      SET is_active = NOT is_active
      WHERE id = $1 AND business_id = $2
      RETURNING *
    `;

    const result = await query(sql, [id, businessId]);
    return result.rows[0];
  }

  /**
   * Delete survey (cascades to questions, responses, etc.)
   */
  static async delete(id, businessId) {
    const sql = `DELETE FROM surveys WHERE id = $1 AND business_id = $2`;
    const result = await query(sql, [id, businessId]);
    return result.rowCount > 0;
  }

  /**
   * Increment response count
   */
  static async incrementResponseCount(surveyId) {
    const sql = `
      UPDATE surveys
      SET response_count = response_count + 1
      WHERE id = $1
      RETURNING response_count
    `;

    const result = await query(sql, [surveyId]);
    return result.rows[0];
  }

  /**
   * Get survey statistics
   */
  static async getStats(surveyId) {
    const sql = `
      SELECT 
        COUNT(r.id) as total_responses,
        COUNT(CASE WHEN a.sentiment_label = 'POSITIVE' THEN 1 END) as positive_count,
        COUNT(CASE WHEN a.sentiment_label = 'NEUTRAL' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN a.sentiment_label = 'NEGATIVE' THEN 1 END) as negative_count,
        AVG(a.sentiment_score) as avg_sentiment
      FROM surveys s
      LEFT JOIN responses r ON s.id = r.survey_id
      LEFT JOIN ai_analysis a ON r.id = a.response_id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await query(sql, [surveyId]);
    return result.rows[0] || {
      total_responses: 0,
      positive_count: 0,
      neutral_count: 0,
      negative_count: 0,
      avg_sentiment: null
    };
  }
}

module.exports = Survey;