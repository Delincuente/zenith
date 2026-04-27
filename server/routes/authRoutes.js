const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validators = require('../middlewares/validators');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validators.auth.register,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user & get tokens
 * @access  Public
 */
router.post(
  '/login',
  validators.auth.login,
  authController.login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookie
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
