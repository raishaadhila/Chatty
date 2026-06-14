const { getData, pushData } = require('../db/firebase');
const { sendMessage: sendWA } = require('../channels/whatsapp');
const email = require('../utils/email');
const logger = require('../utils/logger');

const ESCALATION_KEYWORDS = [
  'complaint', 'komplain', 'kecewa', 'frustrasi', 'marah', 'lapor',
  'refund', 'return', 'cancel', 'batalkan', 'rusak', 'cacat',
  'manager', 'supervisor', 'owner', 'pemilik', 'bos',
  'pengacara', 'lawyer', 'polisi', 'police', 'legal',
];

function detectEscalation(text) {
  const msg = text.toLowerCase();
  return ESCALATION_KEYWORDS.some(k => msg.includes(k));
}

async function checkAndEscalate(workspaceId, customerId, message, channel) {
  if (!detectEscalation(message)) return false;

  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  if (!workspace?.ownerWA && !workspace?.ownerEmail) return false;

  const customerName = customerId.split(':')[1] || customerId;

  const alertMessage = `🚨 *Urgent Alert*\n\nA customer message was escalated for your attention:\n\n👤 Customer: ${customerName}\n💬 Channel: ${channel}\n📝 Message: "${message.substring(0, 200)}"\n\nPlease check your Chatty dashboard.`;

  if (workspace.ownerWA) {
    await sendWA(workspace.ownerWA, alertMessage, workspaceId)
      .catch(err => logger.error('Escalation WA error', { workspaceId, error: err.message }));
  }

  if (workspace.ownerEmail) {
    await email.send({
      to: workspace.ownerEmail,
      subject: `🚨 Urgent: Customer escalation — ${customerName}`,
      text: alertMessage.replace(/\*/g, ''),
    }).catch(err => logger.error('Escalation email error', { workspaceId, error: err.message }));
  }

  await pushData(`/workspaces/${workspaceId}/alerts`, {
    customerId,
    message: message.substring(0, 500),
    channel,
    escalatedAt: Date.now(),
    acknowledged: false,
  });

  logger.info('Escalation sent', { workspaceId, customerId });
  return true;
}

module.exports = { checkAndEscalate, detectEscalation };
