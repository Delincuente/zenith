const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validators = require('../middlewares/validators');

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
 * @access  Public
 */
router.post('/logout', authController.logout);

module.exports = router;
