const { body } = require('express-validator');
const validate = require('./validate');

/**
 * Validation rules for Tasks module
 */
const taskValidator = {
  createTask: validate([
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
    body('description')
      .optional({ checkFalsy: true })
      .trim(),
    body('project_id')
      .notEmpty().withMessage('Project ID is required')
      .isUUID().withMessage('Invalid Project ID format'),
    body('assigned_to')
      .optional({ checkFalsy: true })
      .isUUID().withMessage('Invalid User ID format for assigned_to'),
  ]),
};

module.exports = taskValidator;
