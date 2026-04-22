const { body } = require('express-validator');
const validate = require('./validate');

/**
 * Centralized validation rules for all controllers
 */
const validators = {
  auth: {
    register: validate([
      body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
      body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
      body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
      body('role')
        .optional()
        .isIn(['admin', 'client']).withMessage('Role must be either admin or client'),
    ]),
    login: validate([
      body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
      body('password')
        .notEmpty().withMessage('Password is required'),
    ]),
  },

  client: {
    createClient: validate([
      body('company_name')
        .trim()
        .notEmpty().withMessage('Company name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
      body('phone')
        .optional({ checkFalsy: true })
        .isLength({ max: 20 }).withMessage('Phone number must not exceed 20 characters'),
    ]),
  },

  project: {
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
        .isUUID().withMessage('Invalid Client ID format'),
      body('deadline')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Deadline must be a valid date'),
    ]),
  },

  task: {
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
  },
};

module.exports = validators;
