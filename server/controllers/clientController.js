const clientService = require('../services/clientService');

/**
 * POST /api/clients
 * Create a new client for the authenticated user.
 */
exports.createClient = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body, req.user.id);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/clients
 * Get all clients belonging to the authenticated user.
 */
exports.getClients = async (req, res, next) => {
  try {
    const clients = await clientService.getClients(req.user.id);
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/clients/:id
 * Delete a client (blocked if active projects exist).
 */
exports.deleteClient = async (req, res, next) => {
  try {
    await clientService.deleteClient(req.params.id, req.user.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
};
