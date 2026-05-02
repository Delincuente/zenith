/**
 * Middleware to ensure the user has an active Stripe subscription
 */
const requireActiveSubscription = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const isActive = user.subscription_status === 'active' || user.subscription_status === 'trialing';
  const isNotExpired = user.current_period_end && new Date(user.current_period_end) > new Date();

  if (isActive && isNotExpired) {
    return next();
  }

  return res.status(403).json({
    message: 'Active subscription required to access this resource',
    subscription_status: user.subscription_status
  });
};

module.exports = {
  requireActiveSubscription
};
