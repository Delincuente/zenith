const db = require('../models');
const { logActivity } = require('../services/activityService');

exports.createClient = async (req, res) => {
  try {
    const { company_name, phone } = req.body;
    
    // Check if client already exists for this user
    const existing = await db.Client.findOne({ where: { company_name, user_id: req.user.id } });
    if (existing) return res.status(400).json({ message: 'A client with this company name already exists.' });

    const client = await db.Client.create({
      company_name,
      phone,
      user_id: req.user.id,
    });

    await logActivity(req.user.id, 'Created Client', 'Client', client.id);

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClients = async (req, res) => {
  try {
    const clients = await db.Client.findAll({
      where: { user_id: req.user.id }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await db.Client.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Check for associated projects
    const projectCount = await db.Project.count({ where: { client_id: req.params.id } });
    if (projectCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete client. They have ${projectCount} active projects. Please delete the projects first.` 
      });
    }

    await client.destroy();
    await logActivity(req.user.id, 'Deleted Client', 'Client', req.params.id);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
