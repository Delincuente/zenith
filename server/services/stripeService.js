const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Service for interacting with Stripe API
 */
class StripeService {
  /**
   * Creates a Stripe Checkout Session for subscription
   */
  async createSubscriptionSession(user, priceId, successUrl, cancelUrl) {
    return await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id || undefined,
      customer_email: user.stripe_customer_id ? undefined : user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
      },
    });
  }

  /**
   * Verifies Stripe Webhook signature
   */
  verifyWebhook(payload, signature) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }

  /**
   * Retrieves a full subscription object from Stripe
   */
  async getSubscription(subscriptionId) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Retrieves a full invoice object from Stripe
   */
  async getInvoice(invoiceId) {
    return await stripe.invoices.retrieve(invoiceId);
  }
}

module.exports = new StripeService();