const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createSubscriptionSession = async (user, priceId, successUrl, cancelUrl) => {
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
};

exports.verifyWebhook = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};