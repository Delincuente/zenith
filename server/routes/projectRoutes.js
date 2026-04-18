const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const projectValidator = require('../middlewares/projectValidator');

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post(
  '/',
  projectValidator.createProject,
  projectController.createProject
);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for the logged-in user
 * @access  Private
 */
router.get('/', projectController.getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project details
 * @access  Private
 */
router.get('/:id', projectController.getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put('/:id', projectController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private
 */
router.delete('/:id', projectController.deleteProject);

module.exports = router;
