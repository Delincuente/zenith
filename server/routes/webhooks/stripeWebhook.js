const express = require('express');
const router = express.Router();
const webhookController = require('../../controllers/webhookController');

/**
 * Stripe Webhook Route
 * NOTE: This route needs raw body for signature verification.
 * It is handled in server.js by mounting this router before express.json()
 * or by using express.raw() specifically for this route.
 */
router.post('/', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

module.exports = router;
