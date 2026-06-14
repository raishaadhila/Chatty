const jwt = require('jsonwebtoken');
const config = require('../config');
const { getData } = require('../db/firebase');
const logger = require('../utils/logger');

const PLAN_LIMITS = {
  starter: {
    aiConversations: 500,
    channels: 2,
    customerProfiles: 500,
    invoices: 3,
    followUpSequences: 2,
    teamSeats: 1,
    workspaces: 1,
  },
  growth: {
    aiConversations: 2500,
    channels: 3,
    customerProfiles: Infinity,
    invoices: Infinity,
    followUpSequences: Infinity,
    teamSeats: 2,
    workspaces: 1,
  },
  pro: {
    aiConversations: Infinity,
    channels: Infinity,
    customerProfiles: Infinity,
    invoices: Infinity,
    followUpSequences: Infinity,
    teamSeats: 5,
    workspaces: 10,
  },
};

function requireWorkspace(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.cookies?.token ||
                req.query?.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.workspaceId = decoded.workspaceId;
    req.userId = decoded.userId;
    req.userRole = decoded.role || 'owner';
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function loadWorkspace(req, res, next) {
  try {
    const workspace = await getData(`/workspaces/${req.workspaceId}/config`);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    req.workspace = workspace;
    req.plan = workspace.plan || 'starter';
    req.limits = PLAN_LIMITS[req.plan] || PLAN_LIMITS.starter;
    next();
  } catch (err) {
    logger.error('Workspace load error', { workspaceId: req.workspaceId, error: err.message });
    return res.status(500).json({ error: 'Failed to load workspace' });
  }
}

async function enforcePlanLimit(req, res, next) {
  const { usage } = req;
  const { limits } = req;
  const limitType = req.limitType;

  if (!limitType || !limits) return next();

  const currentUsage = usage?.[limitType] || 0;
  const limit = limits[limitType];

  if (currentUsage >= limit) {
    return res.status(403).json({
      error: 'Plan limit reached',
      limitType,
      limit,
      currentUsage,
      upgradeUrl: '/api/billing/portal',
    });
  }
  next();
}

module.exports = { requireWorkspace, loadWorkspace, enforcePlanLimit, PLAN_LIMITS };
