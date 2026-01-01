// src/services/analysisService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');
const { SENTIMENT_THRESHOLDS, SENTIMENT_LABELS } = require('../utils/constants');
const logger = require('../utils/logger');

// Lazy initialization - get API keys when needed (after dotenv loads)
const getGeminiKeys = () => (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
const getGroqKey = () => process.env.GROQ_API_KEY;
const getOpenAIKey = () => process.env.OPENAI_API_KEY;
const getHfKey = () => process.env.HF_API_KEY;

const getGenAIs = () => getGeminiKeys().map(key => new GoogleGenerativeAI(key));
const getGroq = () => {
  const key = getGroqKey();
  return key ? new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' }) : null;
};
const getOpenAI = () => {
  const key = getOpenAIKey();
  return key ? new OpenAI({ apiKey: key }) : null;
};

/**
 * AI-powered sentiment analysis service with multiple AI provider fallbacks
 */
class AnalysisService {
  /**
   * Analyze text using AI with fallbacks
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

    const prompt = `Analyze the sentiment of this customer feedback and respond ONLY with valid JSON (no markdown, no code blocks):
      
"${text}"

Respond with this exact JSON format:
{"score": <number from -1 to 1>, "label": "<POSITIVE or NEUTRAL or NEGATIVE>", "themes": ["theme1", "theme2"]}

Rules:
- score: -1 (very negative) to 1 (very positive), 0 is neutral
- label: POSITIVE if score > 0.25, NEGATIVE if score < -0.25, else NEUTRAL
- themes: extract 1-3 key topics mentioned (e.g., "service", "food quality", "wait time")`;

    // Try Gemini first
    const genAIs = getGenAIs();
    for (let i = 0; i < genAIs.length; i++) {
      try {
        const model = genAIs[i].getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text().trim();
        return this.parseAnalysisResponse(responseText);
      } catch (error) {
        logger.error(`Gemini key ${i + 1} failed for analysis:`, error.message);
      }
    }

    // Try Groq (FREE)
    const groq = getGroq();
    if (groq) {
      try {
        logger.info('Trying Groq for analysis...');
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 256,
        });
        const responseText = completion.choices[0].message.content.trim();
        return this.parseAnalysisResponse(responseText);
      } catch (error) {
        logger.error('Groq analysis error:', error.message);
      }
    }

    // Try OpenAI
    const openai = getOpenAI();
    if (openai) {
      try {
        logger.info('Trying OpenAI for analysis...');
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 256,
        });
        const responseText = completion.choices[0].message.content.trim();
        return this.parseAnalysisResponse(responseText);
      } catch (error) {
        logger.error('OpenAI analysis error:', error.message);
      }
    }

    // Fallback to simple keyword analysis
    logger.warn('All AI providers failed, using fallback keyword analysis');
    return this.fallbackAnalysis(text);
  }

  /**
   * Parse AI response into analysis result
   */
  static parseAnalysisResponse(responseText) {
    // Clean up response - remove markdown code blocks if present
    let cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(cleanText);

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
