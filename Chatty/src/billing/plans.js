const { getData, updateData } = require('../db/firebase');
const logger = require('../utils/logger');

const PLANS = {
  starter: {
    name: 'Starter',
    price: 19,
    annualPrice: 15,
    limits: {
      aiConversations: 500,
      channels: 2,
      customerProfiles: 500,
      invoices: 3,
      followUpSequences: 2,
      teamSeats: 1,
      workspaces: 1,
      ownerBriefings: false,
      brandedReports: false,
      apiAccess: false,
    },
  },
  growth: {
    name: 'Growth',
    price: 59,
    annualPrice: 47,
    limits: {
      aiConversations: 2500,
      channels: 3,
      customerProfiles: Infinity,
      invoices: Infinity,
      followUpSequences: Infinity,
      teamSeats: 2,
      workspaces: 1,
      ownerBriefings: true,
      brandedReports: false,
      apiAccess: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 149,
    annualPrice: 119,
    limits: {
      aiConversations: Infinity,
      channels: Infinity,
      customerProfiles: Infinity,
      invoices: Infinity,
      followUpSequences: Infinity,
      teamSeats: 5,
      workspaces: 10,
      ownerBriefings: true,
      brandedReports: true,
      apiAccess: true,
    },
  },
};

async function checkLimit(workspaceId, limitType) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  if (!workspace) return { allowed: false, reason: 'Workspace not found' };

  const plan = workspace.plan || 'starter';
  const limits = PLANS[plan]?.limits;
  if (!limits) return { allowed: false, reason: 'Invalid plan' };

  const limit = limits[limitType];
  if (limit === undefined) return { allowed: false, reason: 'Unknown limit type' };

  if (limit === Infinity) return { allowed: true };

  const usage = await getData(`/workspaces/${workspaceId}/usage/${limitType}`) || 0;
  if (usage >= limit) {
    return { allowed: false, reason: 'Plan limit reached', limit, usage };
  }

  return { allowed: true, usage, limit };
}

async function incrementUsage(workspaceId, metric) {
  const ref = `/workspaces/${workspaceId}/usage/${metric}`;
  const current = await getData(ref) || 0;
  await updateData(ref, current + 1);
  logger.debug('Usage incremented', { workspaceId, metric, newValue: current + 1 });
}

async function getWorkspacePlan(workspaceId) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  const plan = workspace?.plan || 'starter';
  return {
    ...PLANS[plan],
    plan,
    stripeCustomerId: workspace?.stripeCustomerId,
    billingStatus: workspace?.billingStatus || 'active',
  };
}

async function getPlanPriceId(plan, isAnnual = false) {
  const cfg = require('../config');
  const key = `${plan}_${isAnnual ? 'annual' : 'monthly'}`;
  return cfg.stripe.priceIds[plan] || null;
}

module.exports = { PLANS, checkLimit, incrementUsage, getWorkspacePlan, getPlanPriceId };
