// src/models/Answer.js
const { query } = require('../config/database');

class Answer {
  /**
   * Create a single answer
   * We store question_text for historical accuracy (in case question is edited later)
   */
  static async create({ response_id, question_id, question_text, answer_type, answer_text, answer_rating, answer_choice }) {
    const sql = `
      INSERT INTO answers (response_id, question_id, question_text, answer_type, answer_text, answer_rating, answer_choice)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [response_id, question_id, question_text, answer_type, answer_text, answer_rating, answer_choice];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Create multiple answers at once (for a single response)
   * This is more efficient than creating one by one
   */
  static async createMany(answers) {
    if (!answers || answers.length === 0) {
      return [];
    }

    // Build the VALUES part of the query
    const values = [];
    const placeholders = answers.map((answer, index) => {
      const offset = index * 7;
      values.push(
        answer.response_id,
        answer.question_id,
        answer.question_text,
        answer.answer_type,
        answer.answer_text || null,
        answer.answer_rating || null,
        answer.answer_choice || null
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
    });

    const sql = `
      INSERT INTO answers (response_id, question_id, question_text, answer_type, answer_text, answer_rating, answer_choice)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows;
  }

  /**
   * Get all answers for a response
   */
  static async findByResponseId(responseId) {
    const sql = `
      SELECT * FROM answers 
      WHERE response_id = $1 
      ORDER BY id ASC
    `;

    const result = await query(sql, [responseId]);
    return result.rows;
  }

  /**
   * Get all answers for a specific question (across all responses)
   * Useful for analytics
   */
  static async findByQuestionId(questionId) {
    const sql = `
      SELECT a.*, r.submitted_at
      FROM answers a
      JOIN responses r ON a.response_id = r.id
      WHERE a.question_id = $1
      ORDER BY r.submitted_at DESC
    `;

    const result = await query(sql, [questionId]);
    return result.rows;
  }

  /**
   * Get text answers for a survey (for sentiment analysis)
   */
  static async getTextAnswersForSurvey(surveyId) {
    const sql = `
      SELECT a.*, r.id as response_id
      FROM answers a
      JOIN responses r ON a.response_id = r.id
      WHERE r.survey_id = $1 
        AND a.answer_text IS NOT NULL 
        AND a.answer_text != ''
      ORDER BY r.submitted_at DESC
    `;

    const result = await query(sql, [surveyId]);
    return result.rows;
  }

  /**
   * Get average rating for a question
   */
  static async getAverageRating(questionId) {
    const sql = `
      SELECT 
        AVG(answer_rating) as average_rating,
        COUNT(*) as total_ratings
      FROM answers 
      WHERE question_id = $1 AND answer_rating IS NOT NULL
    `;

    const result = await query(sql, [questionId]);
    return result.rows[0];
  }
}

module.exports = Answer;
