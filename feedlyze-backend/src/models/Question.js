// src/models/Question.js
const { query, getClient } = require('../config/database');

class Question {
  /**
   * Create a new question
   * @param {Object} questionData
   * @returns {Promise<Object>}
   */
  static async create({ survey_id, question_text, question_type, options, is_required, display_order }) {
    const sql = `
      INSERT INTO questions (survey_id, question_text, question_type, options, is_required, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      survey_id,
      question_text,
      question_type,
      options ? JSON.stringify(options) : null,
      is_required !== undefined ? is_required : false,
      display_order
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Get all questions for a survey
   */
  static async findBySurveyId(surveyId) {
    const sql = `
      SELECT * FROM questions
      WHERE survey_id = $1
      ORDER BY display_order ASC
    `;

    const result = await query(sql, [surveyId]);
    return result.rows;
  }

  /**
   * Get question by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM questions WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update question
   */
  static async update(id, { question_text, question_type, options, is_required }) {
    const sql = `
      UPDATE questions
      SET 
        question_text = COALESCE($1, question_text),
        question_type = COALESCE($2, question_type),
        options = COALESCE($3, options),
        is_required = COALESCE($4, is_required)
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      question_text,
      question_type,
      options ? JSON.stringify(options) : null,
      is_required,
      id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Delete question
   */
  static async delete(id) {
    const sql = `DELETE FROM questions WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  /**
   * Reorder questions
   * @param {Array} questions - Array of { id, display_order }
   */
  static async reorder(questions) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      for (const question of questions) {
        await client.query(
          'UPDATE questions SET display_order = $1 WHERE id = $2',
          [question.display_order, question.id]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get next display order for a survey
   */
  static async getNextDisplayOrder(surveyId) {
    const sql = `
      SELECT COALESCE(MAX(display_order), 0) + 1 as next_order
      FROM questions
      WHERE survey_id = $1
    `;

    const result = await query(sql, [surveyId]);
    return result.rows[0].next_order;
  }

  /**
   * Validate question belongs to survey
   */
  static async belongsToSurvey(questionId, surveyId) {
    const sql = `
      SELECT id FROM questions
      WHERE id = $1 AND survey_id = $2
    `;

    const result = await query(sql, [questionId, surveyId]);
    return result.rows.length > 0;
  }

  /**
   * Get question count for survey
   */
  static async countBySurveyId(surveyId) {
    const sql = `SELECT COUNT(*) as count FROM questions WHERE survey_id = $1`;
    const result = await query(sql, [surveyId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Question;