const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');

let client = null;

function getClient() {
  if (client) return client;
  if (!config.openai.apiKey) {
    logger.warn('OpenAI API key not set');
    return null;
  }
  client = new OpenAI({ apiKey: config.openai.apiKey });
  return client;
}

async function chat(systemPrompt, messages, opts = {}) {
  const c = getClient();
  if (!c) throw new Error('OpenAI client not configured');

  const response = await c.chat.completions.create({
    model: opts.model || 'gpt-4o',
    max_tokens: opts.maxTokens || 512,
    temperature: opts.temperature ?? 0.5,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ],
  });

  return response.choices[0]?.message?.content?.trim() || '';
}

module.exports = { chat, getClient };
