// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation
} = require('../middlewares/validationMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register new business
 * @access  Public
 */
router.post('/register', registerValidation, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login business and get JWT token
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request a password reset
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with a token
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current business profile
 * @access  Private (requires JWT)
 */
router.get('/profile', verifyToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update business profile
 * @access  Private (requires JWT)
 */
router.put('/profile', verifyToken, updateProfileValidation, authController.updateProfile);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get('/google', require('passport').authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth Callback
 * @access  Public
 */
router.get('/google/callback', 
  require('passport').authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

module.exports = router;