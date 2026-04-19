const db = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

/**
 * Create a new client for the given user.
 * @param {{ company_name: string, phone?: string }} data
 * @param {string} userId
 * @returns {object} The created client record
 * @throws {AppError} 400 if a client with the same company name already exists
 */
const createClient = async ({ company_name, phone }, userId) => {
  const existing = await db.Client.findOne({ where: { company_name, user_id: userId } });
  if (existing) throw new AppError('A client with this company name already exists.', 400);

  const client = await db.Client.create({ company_name, phone, user_id: userId });
  await logActivity(userId, 'Created Client', 'Client', client.id);

  return client;
};

/**
 * Retrieve all clients belonging to the given user.
 * @param {string} userId
 * @returns {object[]} Array of client records
 */
const getClients = async (userId) => {
  return db.Client.findAll({ where: { user_id: userId } });
};

/**
 * Delete a client by ID, enforcing ownership and dependency checks.
 * @param {string} clientId
 * @param {string} userId
 * @throws {AppError} 404 if client not found; 400 if it has linked projects
 */
const deleteClient = async (clientId, userId) => {
  const client = await db.Client.findOne({ where: { id: clientId, user_id: userId } });
  if (!client) throw new AppError('Client not found', 404);

  const projectCount = await db.Project.count({ where: { client_id: clientId } });
  if (projectCount > 0) {
    throw new AppError(
      `Cannot delete client. They have ${projectCount} active project(s). Please delete the projects first.`,
      400
    );
  }

  await client.destroy();
  await logActivity(userId, 'Deleted Client', 'Client', clientId);
};

module.exports = { createClient, getClients, deleteClient };
