const { Router } = require('express');
const config = require('../config');
const { getData, updateData } = require('../db/firebase');
const { handleInboundMessage } = require('../bot/messageHandler');
const { checkAndEscalate } = require('../reports/alert');
const wa = require('../channels/whatsapp');
const tg = require('../channels/telegram');
const logger = require('../utils/logger');

const router = Router();

router.get('/whatsapp', (req, res) => {
  try {
    const challenge = wa.verifyWebhook(req.query);
    return res.status(200).send(challenge);
  } catch (err) {
    logger.error('WhatsApp webhook verification failed', { error: err.message });
    return res.status(403).send('Verification failed');
  }
});

router.post('/whatsapp', async (req, res) => {
  try {
    const parsed = wa.parseInbound(req.body);
    if (!parsed) return res.sendStatus(200);

    const { from, text } = parsed;

    const workspaces = await getData('/workspaces');
    if (!workspaces) return res.sendStatus(200);

    let handled = false;
    for (const [workspaceId, ws] of Object.entries(workspaces)) {
      const channelConfig = ws.config?.channels?.whatsapp;
      if (!channelConfig?.enabled) continue;

      const result = await handleInboundMessage(workspaceId, 'whatsapp', from, text);
      if (result.reply) {
        await wa.sendMessage(from, result.reply, workspaceId);
        await checkAndEscalate(workspaceId, `whatsapp:${from}`, text, 'whatsapp');
        handled = true;
        break;
      }
    }

    if (!handled) {
      logger.warn('WhatsApp message not routed', { from });
    }

    res.sendStatus(200);
  } catch (err) {
    logger.error('WhatsApp webhook error', { error: err.message });
    res.sendStatus(200);
  }
});

router.post('/telegram', async (req, res) => {
  try {
    const parsed = tg.parseInbound(req.body);
    if (!parsed) return res.sendStatus(200);

    const { from: chatId, text, userName } = parsed;

    const workspaces = await getData('/workspaces');
    if (!workspaces) return res.sendStatus(200);

    let handled = false;
    for (const [workspaceId, ws] of Object.entries(workspaces)) {
      const channelConfig = ws.config?.channels?.telegram;
      if (!channelConfig?.enabled) continue;

      const result = await handleInboundMessage(workspaceId, 'telegram', chatId, text, userName);
      if (result.reply) {
        await tg.sendMessage(chatId, result.reply);
        await checkAndEscalate(workspaceId, `telegram:${chatId}`, text, 'telegram');
        handled = true;
        break;
      }
    }

    if (!handled) {
      logger.warn('Telegram message not routed', { chatId });
    }

    res.sendStatus(200);
  } catch (err) {
    logger.error('Telegram webhook error', { error: err.message });
    res.sendStatus(200);
  }
});

module.exports = router;
