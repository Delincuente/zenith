const projectService = require('../services/projectService');

/**
 * POST /api/projects
 * Create a new project for the authenticated user.
 */
exports.createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects
 * Get a paginated, filtered list of the user's projects.
 */
exports.getProjects = async (req, res, next) => {
  try {
    const result = await projectService.getProjects(req.query, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 * Get full details of a single project.
 */
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 * Update an existing project.
 */
exports.updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 * Delete a project by ID.
 */
exports.deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
