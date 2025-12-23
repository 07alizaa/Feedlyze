// src/models/Business.js
const { query } = require('../config/database');
const bcrypt = require('bcrypt');
const { BCRYPT_SALT_ROUNDS } = require('../utils/constants');

class Business {
  /**
   * Create a new business account
   * @param {Object} businessData - { business_name, email, password, industry, phone }
   * @returns {Promise<Object>} - Created business (without password)
   */
  static async create({ business_name, email, password, industry, phone }) {
    // Hash password
    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const sql = `
      INSERT INTO businesses (business_name, email, password_hash, industry, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, business_name, email, industry, phone, created_at
    `;

    const values = [business_name, email, password_hash, industry, phone];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Find business by email
   * @param {string} email
   * @returns {Promise<Object|null>} - Business with password_hash
   */
  static async findByEmail(email) {
    const sql = `
      SELECT id, business_name, email, password_hash, industry, phone, created_at
      FROM businesses
      WHERE email = $1
    `;

    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find business by ID
   * @param {number} id
   * @returns {Promise<Object|null>} - Business without password_hash
   */
  static async findById(id) {
    const sql = `
      SELECT id, business_name, email, industry, phone, created_at
      FROM businesses
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update business profile
   * @param {number} id
   * @param {Object} updates - { business_name, industry, phone }
   * @returns {Promise<Object>} - Updated business
   */
  static async update(id, { business_name, industry, phone }) {
    const sql = `
      UPDATE businesses
      SET 
        business_name = COALESCE($1, business_name),
        industry = COALESCE($2, industry),
        phone = COALESCE($3, phone)
      WHERE id = $4
      RETURNING id, business_name, email, industry, phone, created_at
    `;

    const values = [business_name, industry, phone, id];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Delete business account
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const sql = `DELETE FROM businesses WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  /**
   * Verify password
   * @param {string} plainPassword
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Check if email already exists
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  static async emailExists(email) {
    const sql = `SELECT id FROM businesses WHERE email = $1`;
    const result = await query(sql, [email]);
    return result.rows.length > 0;
  }

  /**
   * Get business statistics
   * @param {number} businessId
   * @returns {Promise<Object>}
   */
  static async getStats(businessId) {
    const sql = `
      SELECT 
        COUNT(DISTINCT s.id) as total_surveys,
        COUNT(DISTINCT r.id) as total_responses,
        COUNT(DISTINCT s.id) FILTER (WHERE s.is_active = true) as active_surveys
      FROM businesses b
      LEFT JOIN surveys s ON b.id = s.business_id
      LEFT JOIN responses r ON s.id = r.survey_id
      WHERE b.id = $1
      GROUP BY b.id
    `;

    const result = await query(sql, [businessId]);
    return result.rows[0] || {
      total_surveys: 0,
      total_responses: 0,
      active_surveys: 0
    };
  }
}

module.exports = Business;