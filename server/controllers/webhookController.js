const stripeService = require('../services/stripeService');
const db = require('../models');

/**
 * Controller for handling Stripe Webhooks with Idempotency
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeService.verifyWebhook(req.body, sig);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🔁 Idempotency check
  const [webhookEvent, created] = await db.WebhookEvent.findOrCreate({
    where: { event_id: event.id },
    defaults: {
      type: event.type,
      processed: false
    }
  });

  if (!created && webhookEvent.processed) {
    return res.json({ received: true, message: 'Event already processed' });
  }

  const transaction = await db.sequelize.transaction();

  try {
    // =========================================================
    // 🔒 ENTITY-LEVEL LOCKING (Senior Dev Solution)
    // =========================================================
    // We lock the User row at the start of the transaction. 
    // If multiple webhooks for the same user arrive at once, they will 
    // now queue up and process one-by-one instead of fighting (Deadlock).

    const sessionOrSub = event.data.object;
    const customerId = sessionOrSub.customer;
    const metadataUserId = sessionOrSub.metadata?.userId;

    // Try to find and lock the user
    // We use stripe_customer_id if available, otherwise fallback to userId from metadata
    if (customerId || metadataUserId) {
      await db.User.findOne({
        where: customerId ? { stripe_customer_id: customerId } : { id: metadataUserId },
        lock: transaction.LOCK.UPDATE,
        transaction
      });
    }

    switch (event.type) {

      // =========================================================
      // ✅ CHECKOUT COMPLETED (INITIAL LINKING)
      // =========================================================
      case 'checkout.session.completed': {
        const session = event.data.object;

        // 🔥 Only handle subscription mode
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

        break;
      }

      // =========================================================
      // ✅ SUBSCRIPTION CREATED / UPDATED
      // =========================================================
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        const priceId = subscription.items.data[0]?.price?.id;

        // 🔥 safer plan detection
        const planMap = {
          [process.env.STRIPE_PRO_MONTHLY_PRICE_ID]: 'pro',
          [process.env.STRIPE_PRO_YEARLY_PRICE_ID]: 'pro',
          [process.env.STRIPE_TEAM_MONTHLY_PRICE_ID]: 'team',
          [process.env.STRIPE_TEAM_YEARLY_PRICE_ID]: 'team',
        };

        const plan = planMap[priceId] || 'free';

        let userId = await getUserIdByCustomer(subscription.customer);

        // 🏎️ Race Condition Fallback: Check metadata if customer ID isn't linked yet
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

        break;
      }

      // =========================================================
      // ❌ SUBSCRIPTION DELETED (CANCEL)
      // =========================================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        let userId = await getUserIdByCustomer(subscription.customer);
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

        break;
      }

      // =========================================================
      // 💰 PAYMENT SUCCESS (RECURRING)
      // =========================================================
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(invoice)
        const subscriptionId = invoice.subscription || invoice.parent?.subscription_details?.subscription;

        if (subscriptionId) {
          let userId = await getUserIdByCustomer(invoice.customer);

          // Fallback to metadata from the subscription if available
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

        break;
      }

      // =========================================================
      // ⚠️ PAYMENT FAILED
      // =========================================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        let userId = await getUserIdByCustomer(invoice.customer);
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

        break;
      }

      default:
      // console.log(`Unhandled event type ${event.type}`);
    }

    // ✅ mark processed
    await webhookEvent.update({ processed: true }, { transaction });

    await transaction.commit();
    res.json({ received: true });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
};

/**
 * Helper to get User ID by Stripe Customer ID
 */
async function getUserIdByCustomer(customerId) {
  const user = await db.User.findOne({
    where: { stripe_customer_id: customerId },
    attributes: ['id']
  });
  return user ? user.id : null;
}