/**
 * Custom application error class.
 * Extends the built-in Error to include an HTTP status code,
 * enabling clean, structured error propagation from service → controller → errorHandler.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 403, 500)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
