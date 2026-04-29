const db = require('../models');
const AppError = require('../utils/AppError');

/**
 * PUT /api/users/profile
 * Update current user's profile information (name, email).
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being changed and if the new email is already in use
    if (email && email !== user.email) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/change-password
 * Change current user's password.
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
