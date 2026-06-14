const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const TG_API = `https://api.telegram.org/bot${config.telegram.botToken}`;

async function sendMessage(chatId, text, opts = {}) {
  if (!config.telegram.botToken) {
    logger.warn('Telegram bot token not set');
    return null;
  }

  try {
    const response = await axios.post(`${TG_API}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: opts.parseMode || 'Markdown',
      disable_web_page_preview: true,
    });
    return response.data;
  } catch (err) {
    logger.error('Telegram send error', { chatId, error: err.response?.data || err.message });
    throw err;
  }
}

async function sendDocument(chatId, documentUrl, caption) {
  if (!config.telegram.botToken) return null;

  try {
    const response = await axios.post(`${TG_API}/sendDocument`, {
      chat_id: chatId,
      document: documentUrl,
      caption,
    });
    return response.data;
  } catch (err) {
    logger.error('Telegram document send error', { chatId, error: err.response?.data || err.message });
    throw err;
  }
}

async function setWebhook(url) {
  if (!config.telegram.botToken) return null;
  const response = await axios.post(`${TG_API}/setWebhook`, { url });
  return response.data;
}

function parseInbound(body) {
  if (!body?.message) return null;
  const msg = body.message;
  if (!msg.text) return null;

  return {
    from: String(msg.chat.id),
    text: msg.text,
    messageId: msg.message_id,
    timestamp: msg.date,
    channel: 'telegram',
    userName: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' '),
  };
}

module.exports = { sendMessage, sendDocument, setWebhook, parseInbound };
