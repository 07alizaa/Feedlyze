// src/utils/constants.js

module.exports = {
  // Sentiment Analysis Thresholds
  SENTIMENT_THRESHOLDS: {
    POSITIVE: 0.25,
    NEGATIVE: -0.25
  },

  // Sentiment Labels
  SENTIMENT_LABELS: {
    POSITIVE: 'POSITIVE',
    NEGATIVE: 'NEGATIVE',
    NEUTRAL: 'NEUTRAL'
  },

  // Question Types
  QUESTION_TYPES: {
    TEXT: 'text',
    RATING: 'rating',
    MCQ: 'mcq'
  },

  // Valid Question Types Array
  VALID_QUESTION_TYPES: ['text', 'rating', 'mcq'],

  // Rating Range
  RATING_RANGE: {
    MIN: 1,
    MAX: 5
  },

  // JWT
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Bcrypt Salt Rounds
  BCRYPT_SALT_ROUNDS: 10,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};