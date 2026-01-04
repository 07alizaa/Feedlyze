// src/models/Response.js
const { query, getClient } = require('../config/database');

class Response {
  /**
   * Create a new response (customer feedback submission)
   * Also increments the survey's response_count
   */
  static async create({ survey_id, business_id, device_type }) {
    const sql = `
      INSERT INTO responses (survey_id, business_id, device_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [survey_id, business_id, device_type || 'unknown'];
    const result = await query(sql, values);

    // Increment response count on the survey
    await query(
      `UPDATE surveys SET response_count = response_count + 1 WHERE id = $1`,
      [survey_id]
    );

    return result.rows[0];
  }

  /**
   * Get response by ID
   */
  static async findById(id) {
    const sql = `
      SELECT r.*, s.title as survey_title
      FROM responses r
      JOIN surveys s ON r.survey_id = s.id
      WHERE r.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get response by ID with all its answers
   */
  static async findByIdWithAnswers(id) {
    // First get the response
    const response = await this.findById(id);
    
    if (!response) {
      return null;
    }

    // Then get all answers for this response
    const answersResult = await query(
      `SELECT * FROM answers WHERE response_id = $1 ORDER BY id ASC`,
      [id]
    );

    response.answers = answersResult.rows;
    return response;
  }

  /**
   * Get all responses for a survey
   */
  static async findBySurveyId(surveyId, { limit = 50, offset = 0 } = {}) {
    const sql = `
      SELECT 
        r.*,
        COUNT(a.id) as answer_count
      FROM responses r
      LEFT JOIN answers a ON r.id = a.response_id
      WHERE r.survey_id = $1
      GROUP BY r.id
      ORDER BY r.submitted_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [surveyId, limit, offset]);
    return result.rows;
  }

  /**
   * Get total count of responses for a survey
   */
  static async countBySurveyId(surveyId) {
    const sql = `SELECT COUNT(*) as total FROM responses WHERE survey_id = $1`;
    const result = await query(sql, [surveyId]);
    return parseInt(result.rows[0].total);
  }

  /**
   * Get all responses for a business (across all surveys)
   */
  static async findByBusinessId(businessId, { limit = 50, offset = 0 } = {}) {
    const sql = `
      SELECT 
        r.*,
        s.title as survey_title
      FROM responses r
      JOIN surveys s ON r.survey_id = s.id
      WHERE r.business_id = $1
      ORDER BY r.submitted_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [businessId, limit, offset]);
    return result.rows;
  }

  /**
   * Get total count of responses for a business (across all surveys)
   */
  static async countByBusinessId(businessId) {
    const sql = `SELECT COUNT(*) as total FROM responses WHERE business_id = $1`;
    const result = await query(sql, [businessId]);
    return parseInt(result.rows[0].total);
  }

  /**
   * Delete a response (also deletes answers due to CASCADE)
   */
  static async delete(id) {
    const sql = `DELETE FROM responses WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  /**
   * Mark response as AI analyzed
   */
  static async markAsAnalyzed(id) {
    const sql = `
      UPDATE responses 
      SET ai_analyzed = true 
      WHERE id = $1 
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = Response;
