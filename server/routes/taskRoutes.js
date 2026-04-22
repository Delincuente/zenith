const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validators = require('../middlewares/validators');

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  validators.task.createTask,
  taskController.createTask
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for user's projects
 * @access  Private
 */
router.get('/', taskController.getTasks);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', taskController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', taskController.deleteTask);

module.exports = router;
