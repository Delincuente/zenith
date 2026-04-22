const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const validators = require('../middlewares/validators');

// NOTE: These routes should be protected by an auth middleware
// router.use(auth); 

/**
 * @route   POST /api/clients
 * @desc    Create a new client
 * @access  Private
 */
router.post(
  '/',
  validators.client.createClient,
  clientController.createClient
);

/**
 * @route   GET /api/clients
 * @desc    Get all clients for the logged-in user
 * @access  Private
 */
router.get('/', clientController.getClients);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete a client
 * @access  Private
 */
router.delete('/:id', clientController.deleteClient);

module.exports = router;
