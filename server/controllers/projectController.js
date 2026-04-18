const db = require('../models');
const { logActivity } = require('../services/activityService');

// Create Project
exports.createProject = async (req, res) => {
  try {
    const { title, description, client_id, deadline } = req.body;
    
    // Verify client belongs to user
    const client = await db.Client.findOne({ where: { id: client_id, user_id: req.user.id } });
    if (!client) return res.status(404).json({ message: 'Selected client not found.' });

    const project = await db.Project.create({
      title,
      description,
      client_id,
      deadline,
      user_id: req.user.id,
    });

    await logActivity(req.user.id, 'Created Project', 'Project', project.id);

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Projects (with pagination and filtering)
exports.getProjects = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };
    if (status) where.status = status;
    if (search) {
      where.title = { [db.Sequelize.Op.like]: `%${search}%` };
    }

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

    res.json({
      data: projects.rows,
      total: projects.count,
      pages: Math.ceil(projects.count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Project Details
exports.getProjectById = async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: db.Client },
        { model: db.Task },
        { model: db.Comment, include: [{ model: db.User, attributes: ['name'] }] },
        { model: db.Payment },
      ],
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.update(req.body);
    await logActivity(req.user.id, 'Updated Project', 'Project', project.id);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.destroy();
    await logActivity(req.user.id, 'Deleted Project', 'Project', req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
