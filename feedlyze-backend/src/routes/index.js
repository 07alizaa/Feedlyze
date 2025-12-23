// src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
// More routes will be added here later
// const surveyRoutes = require('./surveyRoutes');
// const responseRoutes = require('./responseRoutes');
// const analysisRoutes = require('./analysisRoutes');
// const chatbotRoutes = require('./chatbotRoutes');

// Mount routes
router.use('/auth', authRoutes);
// router.use('/surveys', surveyRoutes);
// router.use('/responses', responseRoutes);
// router.use('/analysis', analysisRoutes);
// router.use('/chatbot', chatbotRoutes);

module.exports = router;