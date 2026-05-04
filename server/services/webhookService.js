const db = require('../models');
const stripeService = require('./stripeService');

class WebhookService {
  /**
   * Main entry point for processing Stripe webhook events
   */
  async processEvent(event) {
    // 1. Idempotency check
    const [webhookEvent, created] = await db.WebhookEvent.findOrCreate({
      where: { event_id: event.id },
      defaults: {
        type: event.type,
        processed: false
      }
    });

    if (!created && webhookEvent.processed) {
      return { received: true, message: 'Event already processed' };
    }

    const transaction = await db.sequelize.transaction();

    try {
      const sessionOrSub = event.data.object;
      const customerId = sessionOrSub.customer;
      const metadataUserId = sessionOrSub.metadata?.userId;

      // Entity-Level Locking to prevent race conditions
      if (customerId || metadataUserId) {
        await db.User.findOne({
          where: customerId ? { stripe_customer_id: customerId } : { id: metadataUserId },
          lock: transaction.LOCK.UPDATE,
          transaction
        });
      }

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object, transaction);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object, transaction);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object, transaction);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object, transaction);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object, transaction);
          break;

        default:
          // Unhandled event types are ignored
          break;
      }

      // Mark event as processed
      await webhookEvent.update({ processed: true }, { transaction });

      await transaction.commit();
      return { received: true };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Handle initial checkout completion
   */
  async handleCheckoutCompleted(session, transaction) {
    if (session.mode === 'subscription') {
      const userId = session.metadata?.userId;

      if (!userId) {
        throw new Error('User ID missing in session metadata');
      }

      await db.User.update(
        {
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        },
        { where: { id: userId }, transaction }
      );
    }
  }

  /**
   * Handle subscription creation or updates
   */
  async handleSubscriptionUpdated(subscription, transaction) {
    const priceId = subscription.items.data[0]?.price?.id;
    const plan = this.getPlanFromPriceId(priceId);

    let userId = await this.getUserIdByCustomer(subscription.customer);

    // Fallback: Check metadata if customer ID isn't linked yet
    if (!userId && subscription.metadata?.userId) {
      userId = subscription.metadata.userId;
    }

    if (!userId) {
      throw new Error(`User not found for Stripe customer: ${subscription.customer}`);
    }

    const periodStart = subscription.current_period_start || subscription.items?.data[0]?.current_period_start || subscription.start_date;
    const periodEnd = subscription.current_period_end || subscription.items?.data[0]?.current_period_end;

    await db.Subscription.upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      user_id: userId,
      plan: plan,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000) : new Date(),
      current_period_end: periodEnd ? new Date(periodEnd * 1000) : new Date(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, { transaction });

    await db.User.update({
      current_plan: plan,
      subscription_status: subscription.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000) : new Date(),
      stripe_subscription_id: subscription.id
    }, {
      where: { stripe_customer_id: subscription.customer },
      transaction
    });
  }

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionDeleted(subscription, transaction) {
    let userId = await this.getUserIdByCustomer(subscription.customer);
    if (!userId && subscription.metadata?.userId) {
      userId = subscription.metadata.userId;
    }

    if (!userId) {
      throw new Error(`User not found for Stripe customer: ${subscription.customer}`);
    }

    await db.Subscription.update({
      status: 'canceled',
    }, {
      where: { stripe_subscription_id: subscription.id },
      transaction
    });

    await db.User.update({
      current_plan: 'free',
      subscription_status: 'canceled',
    }, {
      where: { stripe_customer_id: subscription.customer },
      transaction
    });
  }

  /**
   * Handle successful recurring payments
   */
  async handlePaymentSucceeded(invoice, transaction) {
    const subscriptionId = invoice.subscription || invoice.parent?.subscription_details?.subscription;

    if (subscriptionId) {
      let userId = await this.getUserIdByCustomer(invoice.customer);

      if (!userId) {
        const sub = await stripeService.getSubscription(subscriptionId);
        userId = sub.metadata?.userId;
      }

      if (!userId) {
        throw new Error(`User not found for Stripe customer: ${invoice.customer}`);
      }

      await db.Payment.create({
        user_id: userId,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'paid',
        billing_reason: invoice.billing_reason,
        paid_at: new Date(),
      }, { transaction });

      await db.User.update({
        subscription_status: 'active',
      }, {
        where: { stripe_customer_id: invoice.customer },
        transaction
      });
    }
  }

  /**
   * Handle failed payments
   */
  async handlePaymentFailed(invoice, transaction) {
    let userId = await this.getUserIdByCustomer(invoice.customer);
    if (!userId && invoice.subscription) {
      const sub = await stripeService.getSubscription(invoice.subscription);
      userId = sub.metadata?.userId;
    }

    if (!userId) {
      throw new Error(`User not found for Stripe customer: ${invoice.customer}`);
    }

    await db.User.update({
      subscription_status: 'past_due',
    }, {
      where: { stripe_customer_id: invoice.customer },
      transaction
    });
  }

  /**
   * Helper: Map Price ID to Plan Name
   */
  getPlanFromPriceId(priceId) {
    const planMap = {
      [process.env.STRIPE_PRO_MONTHLY_PRICE_ID]: 'pro',
      [process.env.STRIPE_PRO_YEARLY_PRICE_ID]: 'pro',
      [process.env.STRIPE_TEAM_MONTHLY_PRICE_ID]: 'team',
      [process.env.STRIPE_TEAM_YEARLY_PRICE_ID]: 'team',
    };
    return planMap[priceId] || 'free';
  }

  /**
   * Helper: Get User ID by Stripe Customer ID
   */
  async getUserIdByCustomer(customerId) {
    const user = await db.User.findOne({
      where: { stripe_customer_id: customerId },
      attributes: ['id']
    });
    return user ? user.id : null;
  }
}

module.exports = new WebhookService();
