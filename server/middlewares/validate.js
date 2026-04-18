const { validationResult } = require('express-validator');

/**
 * Wrapper middleware to handle validation results.
 * Appends a handler that checks for errors after the rules have run.
 */
const validate = (rules) => {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }
      next();
    },
  ];
};

module.exports = validate;
