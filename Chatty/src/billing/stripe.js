const Stripe = require('stripe');
const config = require('../config');
const logger = require('../utils/logger');
const { getData, updateData, setData } = require('../db/firebase');

let stripe = null;

function getClient() {
  if (stripe) return stripe;
  if (!config.stripe.secretKey) {
    logger.warn('Stripe not configured');
    return null;
  }
  stripe = new Stripe(config.stripe.secretKey);
  return stripe;
}

async function createCheckoutSession(workspaceId, priceId, successUrl, cancelUrl) {
  const s = getClient();
  if (!s) throw new Error('Stripe not configured');

  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: workspaceId,
    metadata: { workspaceId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  logger.info('Stripe checkout session created', { workspaceId, sessionId: session.id });
  return session;
}

async function createBillingPortalSession(workspaceId, returnUrl) {
  const s = getClient();
  if (!s) throw new Error('Stripe not configured');

  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  if (!workspace?.stripeCustomerId) {
    throw new Error('No Stripe customer found');
  }

  const session = await s.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

async function handleWebhook(event) {
  const s = getClient();
  if (!s) throw new Error('Stripe not configured');

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const workspaceId = session.metadata?.workspaceId || session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      await updateData(`/workspaces/${workspaceId}/config`, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        billingStatus: 'active',
      });

      const subscription = await s.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      const plan = Object.entries(config.stripe.priceIds).find(([, id]) => id === priceId)?.[0] || 'starter';

      await updateData(`/workspaces/${workspaceId}/config`, { plan });
      logger.info('Subscription activated', { workspaceId, plan, subscriptionId });
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      if (!subscriptionId) break;

      const subscription = await s.subscriptions.retrieve(subscriptionId);
      const workspaceId = subscription.metadata?.workspaceId;

      if (workspaceId) {
        await setData(`/workspaces/${workspaceId}/usage/billingPeriod`, {
          start: subscription.current_period_start,
          end: subscription.current_period_end,
          status: 'paid',
        });
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const workspaceId = sub.metadata?.workspaceId;
      if (!workspaceId) break;

      const status = sub.status === 'active' ? 'active'
        : sub.status === 'past_due' ? 'past_due'
        : sub.status === 'canceled' ? 'canceled'
        : 'inactive';

      await updateData(`/workspaces/${workspaceId}/config`, { billingStatus: status });
      logger.info('Subscription updated', { workspaceId, status });
      break;
    }
  }
}

module.exports = { createCheckoutSession, createBillingPortalSession, handleWebhook, getClient };
