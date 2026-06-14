const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');
const logger = require('../utils/logger');

let client = null;

function getClient() {
  if (client) return client;
  if (!config.anthropic.apiKey) {
    logger.warn('Anthropic API key not set');
    return null;
  }
  client = new Anthropic({ apiKey: config.anthropic.apiKey });
  return client;
}

async function chat(systemPrompt, messages, opts = {}) {
  const c = getClient();
  if (!c) throw new Error('Anthropic client not configured');

  const msg = await c.messages.create({
    model: opts.model || 'claude-3-5-sonnet-20241022',
    max_tokens: opts.maxTokens || 512,
    temperature: opts.temperature ?? 0.5,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  });

  const text = msg.content.find(b => b.type === 'text')?.text;
  return text?.trim() || '';
}

async function chatWithFallback(systemPrompt, messages, opts = {}) {
  try {
    return await chat(systemPrompt, messages, opts);
  } catch (err) {
    logger.error('Claude error, falling back to GPT-4o', { error: err.message });
    const gpt4o = require('./gpt4o');
    return gpt4o.chat(systemPrompt, messages, opts);
  }
}

module.exports = { chat, chatWithFallback, getClient };
