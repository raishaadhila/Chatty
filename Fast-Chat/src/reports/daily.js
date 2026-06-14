const { getData, queryData } = require('../db/firebase');
const { sendMessage: sendWA } = require('../channels/whatsapp');
const email = require('../utils/email');
const logger = require('../utils/logger');

async function generateDailyDigest(workspaceId) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  if (!workspace) return null;

  const yesterday = Date.now() - 86400000;

  const customers = await getData(`/workspaces/${workspaceId}/customers`);
  let totalConversations = 0;
  let newCustomers = 0;
  let totalInquiries = 0;

  if (customers) {
    for (const [, customer] of Object.entries(customers)) {
      const messages = customer.messages;
      if (messages) {
        const recentMessages = Object.values(messages).filter(m => m.timestamp > yesterday);
        totalConversations += recentMessages.length;
      }
      if (customer.firstContact > yesterday) {
        newCustomers++;
      }
    }
  }

  const invoices = await getData(`/workspaces/${workspaceId}/invoices`);
  let unpaidInvoices = 0;
  let totalRevenue = 0;
  let invoiceCount = 0;

  if (invoices) {
    for (const [, inv] of Object.entries(invoices)) {
      if (inv.status === 'unpaid') unpaidInvoices++;
      if (inv.status === 'paid') {
        totalRevenue += inv.total || 0;
        invoiceCount++;
      }
    }
  }

  const digest = {
    date: new Date().toISOString().split('T')[0],
    businessName: workspace.businessName || 'Your Business',
    conversations: Math.floor(totalConversations / 2),
    newCustomers,
    totalInquiries,
    unpaidInvoices,
    revenue: totalRevenue,
    revenueFormatted: `Rp ${Number(totalRevenue).toLocaleString('id-ID')}`,
    invoicesGenerated: invoiceCount,
  };

  return digest;
}

function formatDigestWhatsApp(digest) {
  return [
    `☕ *${digest.businessName} — Daily Briefing*`,
    `📅 ${digest.date}`,
    '',
    `💬 Conversations: ${digest.conversations}`,
    `🆕 New customers: ${digest.newCustomers}`,
    `💵 Revenue: ${digest.revenueFormatted}`,
    `📄 Invoices: ${digest.invoicesGenerated}`,
    `⚠️ Unpaid: ${digest.unpaidInvoices}`,
    '',
    digest.unpaidInvoices > 0
      ? `You have ${digest.unpaidInvoices} unpaid invoice(s) — check your dashboard.`
      : 'All invoices are paid ✔',
  ].join('\n');
}

function formatDigestEmail(digest) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${digest.businessName}</h2>
      <p style="color: #666;">Daily Briefing — ${digest.date}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">💬 Conversations</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;"><b>${digest.conversations}</b></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">🆕 New customers</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;"><b>${digest.newCustomers}</b></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">💵 Revenue</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;"><b>${digest.revenueFormatted}</b></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">📄 Invoices generated</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;"><b>${digest.invoicesGenerated}</b></td></tr>
        <tr><td style="padding: 8px;">⚠️ Unpaid invoices</td><td style="padding: 8px; text-align: right;"><b>${digest.unpaidInvoices}</b></td></tr>
      </table>
      ${digest.unpaidInvoices > 0 ? `<p style="color: #e74c3c;">You have ${digest.unpaidInvoices} unpaid invoice(s).</p>` : '<p style="color: #27ae60;">All invoices are paid ✔</p>'}
      <p style="color: #999; font-size: 12px;">Sent by Chatty — AI Customer Service Platform</p>
    </div>
  `;
}

async function sendDailyDigest(workspaceId) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  if (!workspace) return;

  const digest = await generateDailyDigest(workspaceId);
  if (!digest) return;

  if (workspace.ownerWA) {
    await sendWA(workspace.ownerWA, formatDigestWhatsApp(digest), workspaceId)
      .catch(err => logger.error('Digest WA send error', { workspaceId, error: err.message }));
  }

  if (workspace.ownerEmail) {
    await email.send({
      to: workspace.ownerEmail,
      subject: `☕ ${workspace.businessName || 'Your Business'} — Daily Briefing`,
      html: formatDigestEmail(digest),
    }).catch(err => logger.error('Digest email send error', { workspaceId, error: err.message }));
  }

  logger.info('Daily digest sent', { workspaceId });
}

async function sendDailyDigestsToAll() {
  const workspaces = await getData('/workspaces');
  if (!workspaces) return;

  for (const workspaceId of Object.keys(workspaces)) {
    await sendDailyDigest(workspaceId);
  }
}

module.exports = { generateDailyDigest, sendDailyDigest, sendDailyDigestsToAll };
