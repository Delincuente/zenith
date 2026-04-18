const { body } = require('express-validator');
const validate = require('./validate');

/**
 * Validation rules for Clients module
 */
const clientValidator = {
  createClient: validate([
    body('company_name')
      .trim()
      .notEmpty().withMessage('Company name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
    body('phone')
      .optional({ checkFalsy: true })
      .isLength({ max: 20 }).withMessage('Phone number must not exceed 20 characters'),
  ]),
};

module.exports = clientValidator;
