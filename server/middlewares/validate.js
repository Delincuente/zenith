const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Wrapper middleware to run express-validator rules and intercept failures.
 * On a validation error, a 400 AppError is forwarded to the global error handler —
 * keeping the response format consistent with all other error flows.
 *
 * @param {import('express-validator').ValidationChain[]} rules
 * @returns {import('express').RequestHandler[]}
 */
const validate = (rules) => {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new AppError(errors.array()[0].msg, 400);
        error.errors = errors.array();
        return next(error);
      }
      next();
    },
  ];
};

module.exports = validate;
