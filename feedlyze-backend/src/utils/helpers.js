// src/utils/helpers.js
const crypto = require('crypto');

/**
 * Generate a random short code for survey URLs
 * @param {number} length - Length of short code (default: 8)
 * @returns {string} - Random alphanumeric string
 */
const generateShortCode = (length = 8) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Generate unique short code that doesn't exist in database
 * @param {Function} checkExists - Async function to check if code exists
 * @param {number} length - Length of code
 * @returns {Promise<string>}
 */
const generateUniqueShortCode = async (checkExists, length = 8) => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generateShortCode(length);
    const exists = await checkExists(code);
    
    if (!exists) {
      return code;
    }
    
    attempts++;
  }
  
  // If all attempts fail, generate longer code
  return generateShortCode(length + 2);
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Get week start and end dates
 * @param {Date} date
 * @returns {Object} - { startDate, endDate }
 */
const getWeekDates = (date = new Date()) => {
  const current = new Date(date);
  const first = current.getDate() - current.getDay(); // First day is Sunday
  const last = first + 6; // Last day is Saturday

  const startDate = new Date(current.setDate(first));
  const endDate = new Date(current.setDate(last));

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

/**
 * Validate question type
 * @param {string} type
 * @returns {boolean}
 */
const isValidQuestionType = (type) => {
  const validTypes = ['text', 'rating', 'mcq'];
  return validTypes.includes(type);
};

/**
 * Sanitize filename for storage
 * @param {string} filename
 * @returns {string}
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
};

/**
 * Generate random string
 * @param {number} length
 * @returns {string}
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Paginate results
 * @param {number} page - Current page (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Object} - { limit, offset }
 */
const getPagination = (page = 1, pageSize = 20) => {
  const limit = Math.min(pageSize, 100); // Max 100 items per page
  const offset = (page - 1) * limit;
  
  return { limit, offset };
};

module.exports = {
  generateShortCode,
  generateUniqueShortCode,
  formatDate,
  getWeekDates,
  isValidQuestionType,
  sanitizeFilename,
  generateRandomString,
  getPagination
};