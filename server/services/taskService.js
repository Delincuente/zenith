const db = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

/**
 * Emit a Socket.IO event to a project room if a socket server is active.
 * Centralises the socket emit pattern so all task operations use it consistently.
 * @param {string} event - The event name to emit
 * @param {string} projectId - The project ID used to target the room
 * @param {*} payload - Data to broadcast
 */
const emitTaskEvent = (event, projectId, payload) => {
  if (global.io) {
    global.io.to(`project_${projectId}`).emit(event, payload);
  }
};

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

/**
 * Get all tasks belonging to the authenticated user's projects.
 * @param {{ status?: string, search?: string }} filters
 * @param {string} userId
 * @returns {object[]} Array of task records
 */
const getTasks = async ({ status, search }, userId) => {
  const where = {};
  if (status) where.status = status;
  if (search) where.title = { [db.Sequelize.Op.like]: `%${search}%` };

  return db.Task.findAll({
    include: [
      {
        model: db.Project,
        where: { user_id: userId },
        attributes: ['title'],
      },
    ],
    where,
    order: [['created_at', 'DESC']],
  });
};

/**
 * Create a task under a project owned by the user.
 * @param {{ project_id: string, title: string, description?: string, assigned_to?: string }} data
 * @param {string} userId
 * @returns {object} The created task record
 * @throws {AppError} 404 if the project doesn't exist or isn't owned by the user
 */
const createTask = async ({ project_id, title, description, assigned_to }, userId) => {
  const project = await db.Project.findOne({ where: { id: project_id, user_id: userId } });
  if (!project) throw new AppError('Project not found', 404);

  const task = await db.Task.create({ project_id, title, description, assigned_to });
  await logActivity(userId, 'Created Task', 'Task', task.id);

  emitTaskEvent('taskCreated', project_id, task);
  return task;
};

/**
 * Update a task by ID, scoped to the authenticated user's projects.
 * @param {string} taskId
 * @param {object} updates - Fields to update
 * @param {string} userId
 * @returns {object} The updated task record
 * @throws {AppError} 404 if the task isn't found within the user's projects
 */
const updateTask = async (taskId, updates, userId) => {
  const task = await db.Task.findByPk(taskId, {
    include: [{ model: db.Project, where: { user_id: userId } }],
  });
  if (!task) throw new AppError('Task not found', 404);

  await task.update(updates);
  await logActivity(userId, 'Updated Task', 'Task', task.id);

  emitTaskEvent('taskUpdated', task.project_id, task);
  return task;
};

/**
 * Delete a task by ID, scoped to the authenticated user's projects.
 * @param {string} taskId
 * @param {string} userId
 * @throws {AppError} 404 if the task isn't found within the user's projects
 */
const deleteTask = async (taskId, userId) => {
  const task = await db.Task.findByPk(taskId, {
    include: [{ model: db.Project, where: { user_id: userId } }],
  });
  if (!task) throw new AppError('Task not found', 404);

  const projectId = task.project_id;
  await task.destroy();
  await logActivity(userId, 'Deleted Task', 'Task', taskId);

  emitTaskEvent('taskDeleted', projectId, taskId);
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
