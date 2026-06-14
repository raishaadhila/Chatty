const { getData } = require('../db/firebase');
const { sendMessage: sendWA } = require('../channels/whatsapp');
const logger = require('../utils/logger');

async function generateEveningSummary(workspaceId) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  if (!workspace) return null;

  if (workspace.plan === 'starter') return null;

  const today = Date.now() - 86400000;

  const customers = await getData(`/workspaces/${workspaceId}/customers`);
  let conversationsToday = 0;
  let pendingReplies = 0;
  let ordersToday = 0;

  if (customers) {
    for (const [, customer] of Object.entries(customers)) {
      const messages = customer.messages;
      if (messages) {
        const todayMessages = Object.values(messages).filter(m => m.timestamp > today);
        conversationsToday += todayMessages.length;

        const lastMsg = todayMessages[todayMessages.length - 1];
        if (lastMsg?.role === 'user') pendingReplies++;
      }
    }
  }

  const invoices = await getData(`/workspaces/${workspaceId}/invoices`);
  if (invoices) {
    for (const [, inv] of Object.entries(invoices)) {
      if ((inv.date || 0) > today) ordersToday++;
    }
  }

  return {
    date: new Date().toISOString().split('T')[0],
    businessName: workspace.businessName || 'Your Business',
    conversations: Math.floor(conversationsToday / 2),
    pendingReplies,
    ordersToday,
    aiActive: true,
  };
}

function formatEveningWhatsApp(summary) {
  return [
    `🌙 *${summary.businessName} — Evening Wrap-Up*`,
    `📅 ${summary.date}`,
    '',
    `💬 Conversations today: ${summary.conversations}`,
    `⏳ Pending replies: ${summary.pendingReplies}`,
    `📦 Orders/invoices: ${summary.ordersToday}`,
    summary.pendingReplies > 0
      ? `\nYou have ${summary.pendingReplies} conversation(s) needing attention. Check your dashboard.`
      : '\nAll caught up! Your AI handled everything today ✔',
    '',
    'See you tomorrow!',
  ].join('\n');
}

async function sendEveningSummary(workspaceId) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  if (!workspace || workspace.plan === 'starter') return;

  const reportSchedule = workspace.reportSchedule || 'morning';
  if (reportSchedule === 'morning') return;

  const summary = await generateEveningSummary(workspaceId);
  if (!summary) return;

  if (workspace.ownerWA) {
    await sendWA(workspace.ownerWA, formatEveningWhatsApp(summary), workspaceId)
      .catch(err => logger.error('Evening summary WA error', { workspaceId, error: err.message }));
  }

  logger.info('Evening summary sent', { workspaceId });
}

async function sendEveningSummariesToAll() {
  const workspaces = await getData('/workspaces');
  if (!workspaces) return;

  for (const workspaceId of Object.keys(workspaces)) {
    await sendEveningSummary(workspaceId);
  }
}

module.exports = { generateEveningSummary, sendEveningSummary, sendEveningSummariesToAll };
