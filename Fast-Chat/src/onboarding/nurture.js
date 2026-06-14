const { getData, setData } = require('../db/firebase');
const { sendMessage: sendWA } = require('../channels/whatsapp');
const email = require('../utils/email');
const logger = require('../utils/logger');

const NURTURE_STEPS = [
  {
    day: 1,
    channel: 'wa',
    subject: '',
    getMessage: (biz) =>
      `Hi ${biz}! Your AI assistant has been active for a full day 🎉\n\n` +
      `Check your Chatty dashboard to see how many conversations your AI handled. ` +
      `Most businesses save 2-3 hours per day from the first week.`,
  },
  {
    day: 3,
    channel: 'email',
    subject: 'Add your product catalog to Chatty',
    getMessage: (biz) =>
      `Hi ${biz},\n\nYour AI is already answering customer questions, but it works even better ` +
      `when it knows your actual products and prices.\n\n` +
      `→ Upload your catalog: Upload a CSV or connect Google Sheets in your dashboard settings.\n\n` +
      `Once your catalog is connected, your AI can answer stock and pricing questions accurately.`,
  },
  {
    day: 7,
    channel: 'email',
    subject: 'Your first weekly digest is here',
    getMessage: (biz) =>
      `Hi ${biz},\n\nYour first weekly business digest has arrived in your dashboard. ` +
      `It covers your conversations, revenue, and top customers from the past 7 days.\n\n` +
      `We've also sent it to your email if you've set up reports. If not, configure them in Settings.`,
  },
  {
    day: 10,
    channel: 'wa',
    subject: '',
    getMessage: (biz) =>
      `⚡ Quick tip for ${biz}: You've saved time with Chatty's AI replies. ` +
      `Ready to save even more?\n\n` +
      `→ Set up follow-up sequences to automatically re-engage customers who haven't replied.\n` +
      `→ Try it in your dashboard under "Follow-ups".\n\n` +
      `Growth plan users get unlimited sequences and owner briefings.`,
  },
  {
    day: 14,
    channel: 'email',
    subject: 'Two weeks with Chatty — how is it going?',
    getMessage: (biz) =>
      `Hi ${biz},\n\nIt's been two weeks since you started with Chatty. ` +
      `We hope your AI has been handling customer messages smoothly.\n\n` +
      `If you're approaching your Starter plan's 500 conversation limit, ` +
      `you might want to consider upgrading to Growth (2,500 conversations/mo) ` +
      `or Pro (unlimited).\n\n` +
      `→ View plans: Check your dashboard billing page.\n\n` +
      `Reply to this email if you need any help!`,
  },
];

async function getNurtureProgress(workspaceId) {
  const progress = await getData(`/workspaces/${workspaceId}/nurture`);
  return progress || { completedSteps: [], lastSentDay: 0 };
}

async function processNurtureSequence() {
  const workspaces = await getData('/workspaces');
  if (!workspaces) return;

  for (const [workspaceId, ws] of Object.entries(workspaces)) {
    const onboarding = await getData(`/workspaces/${workspaceId}/onboarding`);
    if (!onboarding || !onboarding.completedAt) continue;

    const daysSinceOnboarding = Math.floor((Date.now() - onboarding.completedAt) / 86400000);
    const progress = await getNurtureProgress(workspaceId);

    for (const step of NURTURE_STEPS) {
      if (progress.completedSteps.includes(step.day)) continue;
      if (daysSinceOnboarding < step.day) continue;

      const config = await getData(`/workspaces/${workspaceId}/config`);
      if (!config) continue;

      const message = step.getMessage(config.businessName || 'there');

      try {
        if (step.channel === 'wa' && config.ownerWA) {
          await sendWA(config.ownerWA, message, workspaceId);
        } else if (step.channel === 'email' && config.ownerEmail) {
          await email.send({
            to: config.ownerEmail,
            subject: step.subject,
            text: message,
          });
        } else if (step.channel === 'wa' && !config.ownerWA) {
          continue;
        } else if (step.channel === 'email' && !config.ownerEmail) {
          continue;
        }

        progress.completedSteps.push(step.day);
        progress.lastSentDay = Math.max(progress.lastSentDay, step.day);
        await setData(`/workspaces/${workspaceId}/nurture`, progress);

        logger.info('Nurture step sent', { workspaceId, day: step.day, channel: step.channel });
      } catch (err) {
        logger.error('Nurture step error', { workspaceId, day: step.day, error: err.message });
      }
    }
  }
}

module.exports = { processNurtureSequence, NURTURE_STEPS };
