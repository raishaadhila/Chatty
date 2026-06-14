const { getData, setData, pushData } = require('../db/firebase');
const { sendMessage: sendWA } = require('../channels/whatsapp');
const { sendMessage: sendTG } = require('../channels/telegram');
const claude = require('../ai/claude');
const contextBuilder = require('../ai/contextBuilder');
const { detectTrigger, findEligibleCustomers } = require('./triggers');
const logger = require('../utils/logger');

async function createSequence(workspaceId, sequenceData) {
  const { name, triggerType, steps } = sequenceData;

  if (!name || !triggerType || !steps?.length) {
    throw new Error('Name, trigger type, and at least one step are required');
  }

  if (steps.length > 3) {
    const plan = await getData(`/workspaces/${workspaceId}/config/plan`);
    if (plan === 'starter') {
      throw new Error('Starter plan limited to 3 steps per sequence');
    }
  }

  const result = await pushData(`/workspaces/${workspaceId}/sequences`, {
    name,
    triggerType,
    steps: steps.map((s, i) => ({
      stepNumber: i + 1,
      delayHours: s.delayHours || 0,
      messageTemplate: s.messageTemplate || '',
      aiGenerated: s.aiGenerated !== false,
    })),
    enabled: true,
    createdAt: Date.now(),
  });

  logger.info('Follow-up sequence created', { workspaceId, sequenceId: result.key, name });
  return result;
}

async function processSequences(workspaceId) {
  const sequences = await getData(`/workspaces/${workspaceId}/sequences`);
  if (!sequences) return;

  for (const [seqId, seq] of Object.entries(sequences)) {
    if (!seq.enabled) continue;

    const eligibleCustomers = await findEligibleCustomers(workspaceId, seq.triggerType);

    for (const customer of eligibleCustomers) {
      const executionKey = `${customer.customerId}:${seqId}`;
      const executed = await getData(`/workspaces/${workspaceId}/executedFollowups/${executionKey}`);

      if (executed) continue;

      const customerChannel = customer.channel || 'whatsapp';

      for (const step of seq.steps) {
        const stepKey = `${executionKey}:step${step.stepNumber}`;
        const stepExecuted = await getData(`/workspaces/${workspaceId}/executedFollowups/${stepKey}`);
        if (stepExecuted) continue;

        setTimeout(async () => {
          try {
            let message = step.messageTemplate;

            if (step.aiGenerated) {
              const workspace = await getData(`/workspaces/${workspaceId}/config`);
              const prompt = contextBuilder.buildSystemPrompt(workspace || {});
              const result = await claude.chat(
                `${prompt}\n\nWrite a follow-up message for customer ${customer.customerId}. Keep it concise and personalized.`,
                [],
                { maxTokens: 200 }
              );
              message = result;
            }

            if (customerChannel === 'whatsapp') {
              await sendWA(customer.customerId.replace('whatsapp:', ''), message, workspaceId);
            } else {
              await sendTG(customer.customerId.replace('telegram:', ''), message);
            }

            await setData(`/workspaces/${workspaceId}/executedFollowups/${stepKey}`, {
              sentAt: Date.now(),
              message,
              step: step.stepNumber,
            });

            logger.info('Follow-up step executed', { workspaceId, seqId, customerId: customer.customerId, step: step.stepNumber });
          } catch (err) {
            logger.error('Follow-up step error', { workspaceId, seqId, customerId: customer.customerId, error: err.message });
          }
        }, step.delayHours * 3600000);
      }

      await setData(`/workspaces/${workspaceId}/executedFollowups/${executionKey}`, { triggeredAt: Date.now() });
    }
  }
}

async function toggleSequence(workspaceId, sequenceId, enabled) {
  await setData(`/workspaces/${workspaceId}/sequences/${sequenceId}/enabled`, enabled);
  logger.info('Sequence toggled', { workspaceId, sequenceId, enabled });
}

module.exports = { createSequence, processSequences, toggleSequence };
