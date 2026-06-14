const { Router } = require('express');
const { requireWorkspace, loadWorkspace } = require('../middleware/workspace');
const stripe = require('../billing/stripe');
const { PLANS, getWorkspacePlan } = require('../billing/plans');
const config = require('../config');
const logger = require('../utils/logger');

const router = Router();

router.use(requireWorkspace, loadWorkspace);

router.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

router.get('/current', async (req, res) => {
  try {
    const plan = await getWorkspacePlan(req.workspaceId);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get plan info' });
  }
});

router.post('/create-checkout', async (req, res) => {
  try {
    const { plan, isAnnual } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const priceId = config.stripe.priceIds[plan];
    if (!priceId) {
      return res.status(500).json({ error: 'Price ID not configured for this plan' });
    }

    const successUrl = `${config.dashboardUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${config.dashboardUrl}/billing`;

    const session = await stripe.createCheckoutSession(
      req.workspaceId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    logger.error('Checkout error', { workspaceId: req.workspaceId, error: err.message });
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/portal', async (req, res) => {
  try {
    const returnUrl = `${config.dashboardUrl}/billing`;
    const session = await stripe.createBillingPortalSession(req.workspaceId, returnUrl);
    res.json({ url: session.url });
  } catch (err) {
    logger.error('Portal error', { workspaceId: req.workspaceId, error: err.message });
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

router.post('/stripe-webhook', async (req, res) => {
  const s = stripe.getClient();
  if (!s) return res.status(500).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = s.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    logger.error('Stripe webhook signature error', { error: err.message });
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    await stripe.handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    logger.error('Stripe webhook handler error', { error: err.message });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;
