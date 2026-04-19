/**
 * Middleware to handle 404 Not Found errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handling Middleware
 *
 * Handles both AppError instances (thrown from services) and
 * unexpected runtime errors, normalising the response shape.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
    // Include validation errors array if present (from validate middleware)
    ...(err.errors && { errors: err.errors }),
    // Include stack trace only in non-production environments
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
