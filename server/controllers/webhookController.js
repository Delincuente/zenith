const stripeService = require('../services/stripeService');
const db = require('../models');

/**
 * Controller for handling external webhooks (e.g., Stripe)
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body is already a Buffer because of express.raw in the router
    event = stripeService.verifyWebhook(req.body, sig);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const customerId = session.customer;

        // Update user with stripe customer ID
        await db.User.update(
          { stripe_customer_id: customerId },
          { where: { id: userId } }
        );
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Map Stripe price IDs to your internal plan names
        // This is a simplification; you should have a more robust mapping
        let plan = 'Free';
        if (subscription.items.data[0].price.id === process.env.STRIPE_PRO_MONTHLY_PRICE_ID ||
          subscription.items.data[0].price.id === process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
          plan = 'Pro';
        } else if (subscription.items.data[0].price.id === process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ||
          subscription.items.data[0].price.id === process.env.STRIPE_TEAM_YEARLY_PRICE_ID) {
          plan = 'Team';
        }

        await db.User.update(
          {
            plan: plan,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000)
          },
          { where: { stripe_customer_id: customerId } }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await db.User.update(
          {
            plan: 'Free',
            status: 'canceled',
          },
          { where: { stripe_customer_id: customerId } }
        );
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};
