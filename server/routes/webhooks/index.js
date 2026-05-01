const express = require('express');
const router = express.Router();
const stripeWebhook = require('./stripeWebhook');

// Mount specific webhook routers
router.use('/stripe', stripeWebhook);

module.exports = router;
