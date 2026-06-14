const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const { handleMessage } = require('./messageHandler');
const logger = require('../utils/logger');

function startBot() {
  if (!config.telegram.botToken) {
    logger.warn('TELEGRAM_BOT_TOKEN not set — bot not started');
    return null;
  }

  const bot = new TelegramBot(config.telegram.botToken, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const name = msg.from.first_name || 'there';
    bot.sendMessage(msg.chat.id,
      `👋 Hi ${name}! Welcome to *Kopi Nusantara* ☕\n\n` +
      `I can help you with:\n` +
      `• 📦 Product catalog & pricing\n` +
      `• 📊 Stock availability\n` +
      `• ❓ FAQ & ordering info\n\n` +
      `Just ask me anything! For example:\n` +
      `_"What coffee do you have?"_\n` +
      `_"How much is the Arabica beans?"_\n` +
      `_"How do I pay?"_`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.onText(/\/catalog/, async (msg) => {
    const reply = await handleMessage(String(msg.chat.id), msg.from.first_name, 'show me the full product catalog');
    bot.sendMessage(msg.chat.id, reply);
  });

  bot.onText(/\/stock/, async (msg) => {
    const reply = await handleMessage(String(msg.chat.id), msg.from.first_name, 'show current stock levels');
    bot.sendMessage(msg.chat.id, reply);
  });

  bot.onText(/\/faq/, async (msg) => {
    const reply = await handleMessage(String(msg.chat.id), msg.from.first_name, 'show me frequently asked questions');
    bot.sendMessage(msg.chat.id, reply);
  });

  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = String(msg.chat.id);
    const name = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ');

    bot.sendChatAction(chatId, 'typing');
    const reply = await handleMessage(chatId, name, msg.text);
    bot.sendMessage(chatId, reply);
  });

  bot.on('polling_error', (err) => logger.error('Telegram polling error', { error: err.message }));

  logger.info('Telegram bot started (polling mode)');
  return bot;
}

module.exports = { startBot };
