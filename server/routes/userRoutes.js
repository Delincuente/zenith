const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const validators = require('../middlewares/validators');

// All user routes are protected
router.use(authMiddleware);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', validators.user.updateProfile, userController.updateProfile);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change current user password
 * @access  Private
 */
router.put('/change-password', validators.user.changePassword, userController.changePassword);

module.exports = router;
