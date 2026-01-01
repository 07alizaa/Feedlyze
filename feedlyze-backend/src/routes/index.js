// src/routes/index.js
const express = require('express');
const router = express.Router();
const { authLimiter, apiLimiter } = require('../middlewares/rateLimiter');

// Import route modules
const authRoutes = require('./authRoutes');
const surveyRoutes = require('./surveyRoutes');     
const questionRoutes = require('./questionRoutes'); 
const responseRoutes = require('./responseRoutes');
const analysisRoutes = require('./analysisRoutes');
const insightRoutes = require('./insightRoutes');
const chatbotRoutes = require('./chatbotRoutes');

// Mount routes with rate limiting
// Auth routes: strict rate limiting (5 req/15min for login/register)
router.use('/auth', authLimiter, authRoutes);

// API routes: moderate rate limiting (100 req/15min)
router.use('/surveys', apiLimiter, surveyRoutes);     
router.use('/questions', apiLimiter, questionRoutes);
router.use('/responses', apiLimiter, responseRoutes);
router.use('/analysis', apiLimiter, analysisRoutes);
router.use('/insights', apiLimiter, insightRoutes);

// Chatbot routes: has its own aiLimiter applied internally
router.use('/chatbot', chatbotRoutes);

module.exports = router;