const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/create-checkout-session', billingController.createCheckoutSession);

module.exports = router;
