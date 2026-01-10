const pool = require('../config/database');
const crypto = require('crypto');

const PasswordResetToken = {
  async create(businessId, token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    const result = await pool.query(
      'INSERT INTO password_reset_tokens (business_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [businessId, tokenHash, expiresAt]
    );
    return result.rows[0];
  },

  async findByToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    return result.rows[0];
  },

  async markAsUsed(id) {
    const result = await pool.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

module.exports = PasswordResetToken;
