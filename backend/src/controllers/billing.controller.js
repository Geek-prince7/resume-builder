const Stripe = require('stripe');
const User = require('../models/User');
const { getPlan, publicPlans, planFromStripePrice } = require('../config/plans');
const { getUsageSummary } = require('../services/quota.service');
const { logger } = require('../logger');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

function requireStripe(res) {
  if (stripe) return true;
  res.status(503).json({ error: 'Billing is not configured' });
  return false;
}

exports.getPlans = (_req, res) => {
  res.json(publicPlans());
};

exports.getUsage = async (req, res, next) => {
  try {
    res.json(await getUsageSummary(req.user));
  } catch (err) {
    next(err);
  }
};

exports.createCheckout = async (req, res, next) => {
  try {
    if (!requireStripe(res)) return;
    const plan = getPlan(req.body.planId);
    if (plan.id === 'free' || !plan.stripePriceEnv) {
      return res.status(400).json({ error: 'Choose a paid plan' });
    }
    const priceId = process.env[plan.stripePriceEnv];
    if (!priceId) return res.status(503).json({ error: `${plan.name} billing is not configured` });

    let customerId = req.user.billing?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user.userId },
      });
      customerId = customer.id;
      req.user.billing.stripeCustomerId = customerId;
      await req.user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${frontendUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing?checkout=canceled`,
      client_reference_id: req.user.userId,
      subscription_data: { metadata: { userId: req.user.userId, planId: plan.id } },
      metadata: { userId: req.user.userId, planId: plan.id },
    });
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

exports.createPortal = async (req, res, next) => {
  try {
    if (!requireStripe(res)) return;
    const customerId = req.user.billing?.stripeCustomerId;
    if (!customerId) return res.status(400).json({ error: 'No billing account found' });
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${frontendUrl}/billing`,
    });
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

async function applySubscription(subscription) {
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = planFromStripePrice(priceId);
  const userId = subscription.metadata?.userId;
  const query = userId
    ? { userId }
    : { 'billing.stripeCustomerId': String(subscription.customer) };
  const status = subscription.status === 'active' || subscription.status === 'trialing'
    ? subscription.status
    : subscription.status === 'past_due'
      ? 'past_due'
      : subscription.status === 'canceled'
        ? 'canceled'
        : 'incomplete';
  const periodStart = subscription.items.data[0]?.current_period_start;
  const periodEnd = subscription.items.data[0]?.current_period_end;

  await User.findOneAndUpdate(query, {
    $set: {
      'billing.plan': plan && ['active', 'trialing'].includes(status) ? plan.id : 'free',
      'billing.status': status,
      'billing.stripeCustomerId': String(subscription.customer),
      'billing.stripeSubscriptionId': subscription.id,
      'billing.currentPeriodStart': periodStart ? new Date(periodStart * 1000) : undefined,
      'billing.currentPeriodEnd': periodEnd ? new Date(periodEnd * 1000) : undefined,
      'billing.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      ...(periodStart && periodEnd
        ? {
            'usage.periodStart': new Date(periodStart * 1000),
            'usage.periodEnd': new Date(periodEnd * 1000),
          }
        : {}),
    },
  });
}

exports.webhook = async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('Billing webhook is not configured');
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.warn('Invalid Stripe webhook signature', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await applySubscription(event.data.object);
    }
    res.json({ received: true });
  } catch (err) {
    logger.error('Stripe webhook processing failed', { eventId: event.id, error: err.message });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
