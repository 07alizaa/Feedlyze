// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const surveyRoutes = require('./surveyRoutes');     
const questionRoutes = require('./questionRoutes'); 
const responseRoutes = require('./responseRoutes');

// Future routes (will be added in later phases)
// const analysisRoutes = require('./analysisRoutes');
// const insightRoutes = require('./insightRoutes');
// const chatbotRoutes = require('./chatbotRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/surveys', surveyRoutes);     
router.use('/questions', questionRoutes);
router.use('/responses', responseRoutes);

module.exports = router;