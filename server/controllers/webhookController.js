const stripeService = require('../services/stripeService');
const webhookService = require('../services/webhookService');

/**
 * Controller for handling Stripe Webhooks
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // 1. Verify the webhook signature
    event = stripeService.verifyWebhook(req.body, sig);
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // 2. Delegate business logic to the WebhookService
    const result = await webhookService.processEvent(event);
    
    // 3. Return response to Stripe
    return res.json(result);
    
  } catch (error) {
    console.error(`Webhook Processing Error [${event.type}]:`, error.message);
    return res.status(500).json({ 
      message: 'Webhook processing failed', 
      error: error.message 
    });
  }
};