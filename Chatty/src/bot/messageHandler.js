const aiRouter = require('../ai/router');
const contextBuilder = require('../ai/contextBuilder');
const catalogLookup = require('../ai/catalogLookup');
const { detectUncertainty, getEscalationResponse } = require('../ai/confidence');
const { incrementUsage } = require('../billing/plans');
const { getData, pushData } = require('../db/firebase');
const { checkAndEscalate } = require('../reports/alert');
const logger = require('../utils/logger');

async function handleInboundMessage(workspaceId, channel, from, text, userName) {
  const start = Date.now();

  try {
    const workspace = await getData(`/workspaces/${workspaceId}/config`);
    if (!workspace) return { error: 'Workspace not found' };

    if (workspace.aiDisabled === true) return { error: 'AI is disabled for this workspace' };

    const customerId = `${channel}:${from}`;

    await pushData(`/workspaces/${workspaceId}/customers/${customerId}/messages`, {
      role: 'user',
      content: text,
      channel,
      timestamp: Date.now(),
    });

    const existing = await getData(`/workspaces/${workspaceId}/customers/${customerId}`);
    if (!existing) {
      const customerData = {
        name: userName || from,
        channel,
        firstContact: Date.now(),
      };
      await getData(`/workspaces/${workspaceId}/customers/${customerId}`);
    }

    const historyData = await getData(`/workspaces/${workspaceId}/customers/${customerId}/messages`);
    const history = historyData ? Object.values(historyData).slice(-10) : [];

    const catalog = await catalogLookup.getWorkspaceCatalog(workspaceId);

    const systemPrompt = contextBuilder.buildSystemPrompt(workspace);
    const catalogContext = contextBuilder.buildCatalogContext(catalog);
    const fullSystemPrompt = catalogContext
      ? `${systemPrompt}\n\n--- CURRENT CATALOG ---\n${catalogContext}`
      : `${systemPrompt}\n\nNote: No product catalog is configured yet.`;

    const result = await aiRouter.route(fullSystemPrompt, history.slice(0, -1), text);

    let finalReply = result.reply;
    let escalated = false;

    if (detectUncertainty(result.reply)) {
      escalated = await checkAndEscalate(workspaceId, customerId, text, channel);
      if (escalated) {
        finalReply = getEscalationResponse();
      }
    }

    await pushData(`/workspaces/${workspaceId}/customers/${customerId}/messages`, {
      role: 'assistant',
      content: finalReply,
      channel,
      timestamp: Date.now(),
      escalated: escalated || undefined,
    });

    await incrementUsage(workspaceId, 'aiConversations');

    const conversation = await getData(`/workspaces/${workspaceId}/customers/${customerId}/messages`);
    const messageCount = conversation ? Object.keys(conversation).length : 0;

    logger.info('Message handled', {
      workspaceId,
      channel,
      from,
      latency: Date.now() - start,
      messageCount: messageCount / 2,
      escalated,
    });

    return { reply: finalReply, latency: Date.now() - start, escalated };
  } catch (err) {
    logger.error('Message handler error', { workspaceId, channel, from, error: err.message });
    return { error: 'An error occurred processing your message' };
  }
}

module.exports = { handleInboundMessage };
