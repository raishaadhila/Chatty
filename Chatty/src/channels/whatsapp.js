const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

function verifyWebhook(query) {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    return challenge;
  }
  throw new Error('WhatsApp webhook verification failed');
}

async function sendMessage(to, body, workspaceId) {
  if (!config.whatsapp.accessToken) {
    logger.warn('WhatsApp API not configured');
    return null;
  }

  try {
    const response = await axios.post(
      `${WHATSAPP_API}/${config.whatsapp.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      },
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    logger.info('WhatsApp message sent', { to, workspaceId, messageId: response.data?.messages?.[0]?.id });
    return response.data;
  } catch (err) {
    logger.error('WhatsApp send error', { to, error: err.response?.data || err.message });
    throw err;
  }
}

async function sendMediaMessage(to, type, mediaUrl, caption, workspaceId) {
  if (!config.whatsapp.accessToken) return null;

  try {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type,
      [type]: type === 'document'
        ? { link: mediaUrl, caption, filename: caption }
        : { link: mediaUrl, caption },
    };

    const response = await axios.post(
      `${WHATSAPP_API}/${config.whatsapp.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (err) {
    logger.error('WhatsApp media send error', { to, type, error: err.response?.data || err.message });
    throw err;
  }
}

function parseInbound(body) {
  if (!body?.entry) return null;

  for (const entry of body.entry) {
    for (const change of entry.changes || []) {
      if (change.field !== 'messages') continue;
      const value = change.value;
      if (!value?.messages) continue;

      for (const msg of value.messages) {
        if (msg.type === 'text') {
          return {
            from: msg.from,
            text: msg.text.body,
            messageId: msg.id,
            timestamp: msg.timestamp,
            channel: 'whatsapp',
          };
        }
      }
    }
  }
  return null;
}

module.exports = { verifyWebhook, sendMessage, sendMediaMessage, parseInbound };
