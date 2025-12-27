// src/services/analysisService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SENTIMENT_THRESHOLDS, SENTIMENT_LABELS } = require('../utils/constants');
const logger = require('../utils/logger');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * AI-powered sentiment analysis service using Google Gemini
 */
class AnalysisService {
  /**
   * Analyze text using Gemini AI
   * @param {string} text - Text to analyze
   * @returns {Object} - { score, label, entities }
   */
  static async analyzeText(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        score: 0,
        label: SENTIMENT_LABELS.NEUTRAL,
        entities: []
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyze the sentiment of this customer feedback and respond ONLY with valid JSON (no markdown, no code blocks):
      
"${text}"

Respond with this exact JSON format:
{"score": <number from -1 to 1>, "label": "<POSITIVE or NEUTRAL or NEGATIVE>", "themes": ["theme1", "theme2"]}

Rules:
- score: -1 (very negative) to 1 (very positive), 0 is neutral
- label: POSITIVE if score > 0.25, NEGATIVE if score < -0.25, else NEUTRAL
- themes: extract 1-3 key topics mentioned (e.g., "service", "food quality", "wait time")`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      // Parse JSON response
      const analysis = JSON.parse(responseText);

      // Validate and format
      const score = Math.max(-1, Math.min(1, parseFloat(analysis.score) || 0));
      let label = analysis.label?.toUpperCase();
      
      if (!['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(label)) {
        label = score >= SENTIMENT_THRESHOLDS.POSITIVE ? 'POSITIVE' :
                score <= SENTIMENT_THRESHOLDS.NEGATIVE ? 'NEGATIVE' : 'NEUTRAL';
      }

      const entities = (analysis.themes || []).map(theme => ({
        theme: theme,
        sentiment: label
      }));

      return {
        score: Math.round(score * 100) / 100,
        label,
        entities
      };

    } catch (error) {
      logger.error('Gemini AI analysis error:', error.message);
      // Fallback to simple keyword analysis
      return this.fallbackAnalysis(text);
    }
  }

  /**
   * Fallback keyword-based analysis if AI fails
   */
  static fallbackAnalysis(text) {
    const positiveWords = ['excellent', 'amazing', 'great', 'good', 'love', 'best', 'awesome', 'fantastic', 'wonderful', 'happy', 'satisfied'];
    const negativeWords = ['terrible', 'horrible', 'bad', 'poor', 'hate', 'worst', 'awful', 'disappointed', 'rude', 'slow'];

    const cleanText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      if (cleanText.includes(word)) score += 0.2;
    });

    negativeWords.forEach(word => {
      if (cleanText.includes(word)) score -= 0.2;
    });

    score = Math.max(-1, Math.min(1, score));

    const label = score >= SENTIMENT_THRESHOLDS.POSITIVE ? SENTIMENT_LABELS.POSITIVE :
                  score <= SENTIMENT_THRESHOLDS.NEGATIVE ? SENTIMENT_LABELS.NEGATIVE : 
                  SENTIMENT_LABELS.NEUTRAL;

    return { score, label, entities: [] };
  }

  /**
   * Analyze multiple text answers from a response
   * @param {Array} answers - Array of answer objects with answer_text
   * @returns {Object} - Combined analysis result
   */
  static async analyzeResponse(answers) {
    const textAnswers = answers.filter(a => a.answer_text && a.answer_text.trim().length > 0);
    
    if (textAnswers.length === 0) {
      return {
        score: 0,
        label: SENTIMENT_LABELS.NEUTRAL,
        entities: []
      };
    }

    // Combine all text
    const combinedText = textAnswers.map(a => a.answer_text).join(' ');
    return await this.analyzeText(combinedText);
  }

  /**
   * Get rating-based sentiment
   * Converts numeric ratings to sentiment
   * @param {Array} answers - Array of answers with ratings
   * @returns {Object} - { averageRating, ratingLabel }
   */
  static analyzeRatings(answers) {
    const ratingAnswers = answers.filter(a => a.answer_rating !== null);
    
    if (ratingAnswers.length === 0) {
      return { averageRating: null, ratingLabel: null };
    }

    const total = ratingAnswers.reduce((sum, a) => sum + a.answer_rating, 0);
    const average = total / ratingAnswers.length;

    let ratingLabel;
    if (average >= 4) {
      ratingLabel = SENTIMENT_LABELS.POSITIVE;
    } else if (average <= 2) {
      ratingLabel = SENTIMENT_LABELS.NEGATIVE;
    } else {
      ratingLabel = SENTIMENT_LABELS.NEUTRAL;
    }

    return {
      averageRating: Math.round(average * 10) / 10,
      ratingLabel
    };
  }
}

module.exports = AnalysisService;
