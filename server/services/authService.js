const jwt = require('jsonwebtoken');
const db = require('../models');
const AppError = require('../utils/AppError');

// ---------------------------------------------------------------------------
// Token Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a short-lived access token.
 * @param {{ id: string, role: string }} user
 * @returns {string} Signed JWT
 */
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
  );

/**
 * Generate a long-lived refresh token.
 * @param {{ id: string }} user
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );

// ---------------------------------------------------------------------------
// Auth Cookie Helper
// ---------------------------------------------------------------------------

/** Shared cookie options for the refresh token cookie */
const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, role?: string }} data
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 * @throws {AppError} 400 if email already in use
 */
const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) throw new AppError('Email already in use', 400);

  const user = await db.User.create({
    name,
    email,
    password,
    role: role || 'client',
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refresh_token = refreshToken;
  await user.save();

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, current_plan: user.current_plan, subscription_status: user.subscription_status },
    accessToken,
    refreshToken,
  };
};

/**
 * Authenticate a user with email + password.
 * @param {{ email: string, password: string }} credentials
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 * @throws {AppError} 401 if credentials are invalid
 */
const loginUser = async ({ email, password }) => {
  const user = await db.User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refresh_token = refreshToken;
  await user.save();

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, current_plan: user.current_plan, subscription_status: user.subscription_status },
    accessToken,
    refreshToken,
  };
};

/**
 * Rotate the refresh token and issue a new access token.
 * @param {string} refreshToken - The token from the cookie
 * @returns {{ newAccessToken: string, newRefreshToken: string }}
 * @throws {AppError} 401 if no token provided; 403 if invalid/mismatched
 */
const rotateRefreshToken = async (refreshToken) => {
  if (!refreshToken) throw new AppError('Refresh token required', 401);

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', 403);
  }

  const user = await db.User.findByPk(payload.id);
  if (!user || user.refresh_token !== refreshToken) {
    throw new AppError('Invalid refresh token', 403);
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refresh_token = newRefreshToken;
  await user.save();

  return { newAccessToken, newRefreshToken };
};

/**
 * Invalidate the stored refresh token for the given cookie value.
 * @param {string | undefined} refreshToken
 */
const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    const user = await db.User.findOne({ where: { refresh_token: refreshToken } });
    if (user) {
      user.refresh_token = null;
      await user.save();
    }
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshCookieOptions,
  registerUser,
  loginUser,
  rotateRefreshToken,
  logoutUser,
};
