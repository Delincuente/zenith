const db = require('../models');
const stripeService = require('../services/stripeService');
const { logActivity } = require('../services/activityService');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan, interval } = req.body;
    const user = req.user;

    let priceId;
    if (plan === 'pro') {
      priceId = interval === 'yearly' ? process.env.STRIPE_PRO_YEARLY_PRICE_ID : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    } else if (plan === 'team') {
      priceId = interval === 'yearly' ? process.env.STRIPE_TEAM_YEARLY_PRICE_ID : process.env.STRIPE_TEAM_MONTHLY_PRICE_ID;
    } else {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    if (!priceId) {
      return res.status(400).json({ message: 'Price ID not configured' });
    }

    const successUrl = `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.CLIENT_URL}/billing/cancel`;

    const session = await stripeService.createSubscriptionSession(user, priceId, successUrl, cancelUrl);

    await logActivity(user.id, `Initiated ${plan} (${interval}) Subscription`, 'Billing');

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create Checkout Session Error:', error);
    res.status(500).json({ message: 'Stripe API failure', error: error.message });
  }
};
