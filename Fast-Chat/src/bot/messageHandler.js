const groqClient = require('../ai/groqClient');
const contextBuilder = require('../ai/contextBuilder');
const queries = require('../db/queries');
const logger = require('../utils/logger');

async function handleMessage(chatId, userName, text) {
  try {
    queries.customers.upsert(chatId, userName);

    const dbContext = contextBuilder.buildContext(text);
    const systemPrompt = contextBuilder.SYSTEM_PROMPT + (dbContext ? `\n\n--- STORE DATA ---\n${dbContext}` : '');
    const history = queries.conversations.getHistory(chatId);

    const reply = await groqClient.chat(systemPrompt, history, text);

    queries.conversations.save(chatId, 'user', text);
    queries.conversations.save(chatId, 'assistant', reply);

    logger.info(`Handled message from ${chatId} (${userName})`);
    return reply;
  } catch (err) {
    logger.error('Message handler error', { chatId, error: err.message });
    return 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi admin kami. 🙏';
  }
}

module.exports = { handleMessage };
