const taskService = require('../services/taskService');

/**
 * GET /api/tasks
 * Get all tasks belonging to the authenticated user's projects.
 */
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks(req.query, req.user.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tasks
 * Create a new task under one of the user's projects.
 */
exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id
 * Update an existing task.
 */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task by ID.
 */
exports.deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
