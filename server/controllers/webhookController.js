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
    console.error(`Webhook Signature Error: ${err.message}`);
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

          console.log('✅ User linked with Stripe customer + subscription');
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

        const userId = await getUserIdByCustomer(subscription.customer);

        if (!userId) {
          throw new Error(`User not found for Stripe customer: ${subscription.customer}`);
        }

        await db.Subscription.upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          user_id: userId,
          plan: plan,
          price_id: priceId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { transaction });

        await db.User.update({
          current_plan: plan,
          subscription_status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000),
          stripe_subscription_id: subscription.id
        }, {
          where: { stripe_customer_id: subscription.customer },
          transaction
        });

        console.log('🔄 Subscription synced');
        break;
      }

      // =========================================================
      // ❌ SUBSCRIPTION DELETED (CANCEL)
      // =========================================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        const userId = await getUserIdByCustomer(subscription.customer);
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

        console.log('🚫 Subscription canceled');
        break;
      }

      // =========================================================
      // 💰 PAYMENT SUCCESS (RECURRING)
      // =========================================================
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;

        if (invoice.subscription) {
          const userId = await getUserIdByCustomer(invoice.customer);

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

          console.log('💰 Payment recorded');
        }

        break;
      }

      // =========================================================
      // ⚠️ PAYMENT FAILED
      // =========================================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        const userId = await getUserIdByCustomer(invoice.customer);
        if (!userId) {
          throw new Error(`User not found for Stripe customer: ${invoice.customer}`);
        }

        await db.User.update({
          subscription_status: 'past_due',
        }, {
          where: { stripe_customer_id: invoice.customer },
          transaction
        });

        console.log('⚠️ Payment failed');
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // ✅ mark processed
    await webhookEvent.update({ processed: true }, { transaction });

    await transaction.commit();
    res.json({ received: true });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Webhook processing failed:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
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