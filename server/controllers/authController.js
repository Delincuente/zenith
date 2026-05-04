const authService = require('../services/authService');

/**
 * POST /api/auth/register
 * Register a new user and issue tokens.
 */
exports.register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

    res.cookie('refreshToken', refreshToken, authService.refreshCookieOptions());
    res.status(201).json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and issue tokens.
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

    res.cookie('refreshToken', refreshToken, authService.refreshCookieOptions());
    res.json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 * Rotate the refresh token and return a new access token.
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { newAccessToken, newRefreshToken } = await authService.rotateRefreshToken(
      req.cookies.refreshToken
    );

    res.cookie('refreshToken', newRefreshToken, authService.refreshCookieOptions());
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Invalidate the refresh token and clear the cookie.
 */
exports.logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.cookies.refreshToken);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};
/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      current_plan: req.user.current_plan,
      subscription_status: req.user.subscription_status,
    };
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
