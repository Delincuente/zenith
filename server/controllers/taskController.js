const db = require('../models');
const { logActivity } = require('../services/activityService');

// Get all tasks for user's projects
exports.getTasks = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.title = { [db.Sequelize.Op.like]: `%${search}%` };
    }

    const tasks = await db.Task.findAll({
      include: [
        {
          model: db.Project,
          where: { user_id: req.user.id },
          attributes: ['title']
        }
      ],
      where,
      order: [['created_at', 'DESC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { project_id, title, description, assigned_to } = req.body;
    
    // Check if project exists and belongs to user
    const project = await db.Project.findOne({ where: { id: project_id, user_id: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await db.Task.create({
      project_id,
      title,
      description,
      assigned_to,
    });

    await logActivity(req.user.id, 'Created Task', 'Task', task.id);

    // Notify via socket (implemented later)
    if (global.io) {
      global.io.to(`project_${project_id}`).emit('taskCreated', task);
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await db.Task.findByPk(req.params.id, {
      include: [{ model: db.Project, where: { user_id: req.user.id } }]
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.update(req.body);
    await logActivity(req.user.id, 'Updated Task', 'Task', task.id);

    if (global.io) {
      global.io.to(`project_${task.project_id}`).emit('taskUpdated', task);
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await db.Task.findByPk(req.params.id, {
      include: [{ model: db.Project, where: { user_id: req.user.id } }]
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const projectId = task.project_id;
    await task.destroy();
    await logActivity(req.user.id, 'Deleted Task', 'Task', req.params.id);

    if (global.io) {
      global.io.to(`project_${projectId}`).emit('taskDeleted', req.params.id);
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
