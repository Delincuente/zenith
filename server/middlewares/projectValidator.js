const { body } = require('express-validator');
const validate = require('./validate');

/**
 * Validation rules for Projects module
 */
const projectValidator = {
  createProject: validate([
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
    body('description')
      .optional({ checkFalsy: true })
      .trim(),
    body('client_id')
      .notEmpty().withMessage('Client ID is required')
      .isUUID().withMessage('Invalid Client ID format'), // Assuming UUID based on previous UUID usage
    body('deadline')
      .optional({ checkFalsy: true })
      .isISO8601().withMessage('Deadline must be a valid date'),
  ]),
};

module.exports = projectValidator;
