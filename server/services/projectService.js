const db = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

/**
 * Create a new project, verifying the client belongs to the requesting user.
 * @param {{ title: string, description?: string, client_id: string, deadline?: string }} data
 * @param {string} userId
 * @returns {object} The created project record
 * @throws {AppError} 404 if client not found or doesn't belong to the user
 */
const createProject = async ({ title, description, client_id, deadline }, userId) => {
  const client = await db.Client.findOne({ where: { id: client_id, user_id: userId } });
  if (!client) throw new AppError('Selected client not found.', 404);

  const project = await db.Project.create({
    title,
    description,
    client_id,
    deadline,
    user_id: userId,
  });

  await logActivity(userId, 'Created Project', 'Project', project.id);
  return project;
};

/**
 * Get a paginated and optionally filtered list of projects for the given user.
 * @param {{ status?: string, search?: string, page?: number, limit?: number }} filters
 * @param {string} userId
 * @returns {{ data: object[], total: number, pages: number, currentPage: number }}
 */
const getProjects = async ({ status, search, page = 1, limit = 10 }, userId) => {
  const offset = (page - 1) * limit;

  const where = { user_id: userId };
  if (status) where.status = status;
  if (search) where.title = { [db.Sequelize.Op.like]: `%${search}%` };

  const projects = await db.Project.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    include: [
      { model: db.Client, attributes: ['company_name'] },
      { model: db.Task, attributes: ['id', 'status'] },
    ],
  });

  return {
    data: projects.rows,
    total: projects.count,
    pages: Math.ceil(projects.count / limit),
    currentPage: parseInt(page),
  };
};

/**
 * Get full details of a single project including related entities.
 * @param {string} projectId
 * @param {string} userId
 * @returns {object} The project record with associations
 * @throws {AppError} 404 if not found or not owned by user
 */
const getProjectById = async (projectId, userId) => {
  const project = await db.Project.findOne({
    where: { id: projectId, user_id: userId },
    include: [
      { model: db.Client },
      { model: db.Task },
      { model: db.Comment, include: [{ model: db.User, attributes: ['name'] }] },
      { model: db.Payment },
    ],
  });

  if (!project) throw new AppError('Project not found', 404);
  return project;
};

/**
 * Update a project by ID.
 * @param {string} projectId
 * @param {object} updates - Fields to update
 * @param {string} userId
 * @returns {object} The updated project record
 * @throws {AppError} 404 if not found or not owned by user
 */
const updateProject = async (projectId, updates, userId) => {
  const project = await db.Project.findOne({ where: { id: projectId, user_id: userId } });
  if (!project) throw new AppError('Project not found', 404);

  await project.update(updates);
  await logActivity(userId, 'Updated Project', 'Project', project.id);
  return project;
};

/**
 * Delete a project by ID.
 * @param {string} projectId
 * @param {string} userId
 * @throws {AppError} 404 if not found or not owned by user
 */
const deleteProject = async (projectId, userId) => {
  const project = await db.Project.findOne({ where: { id: projectId, user_id: userId } });
  if (!project) throw new AppError('Project not found', 404);

  await project.destroy();
  await logActivity(userId, 'Deleted Project', 'Project', projectId);
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
