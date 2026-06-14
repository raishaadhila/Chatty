const claude = require('./claude');
const gpt4o = require('./gpt4o');
const logger = require('../utils/logger');

const COMPLEX_KEYWORDS = [
  'compare', 'recommend', 'best', 'difference', 'vs', 'versus',
  'which', 'suggestion', 'advice', 'rekomendasi', 'perbandingan',
  'review', 'ulasan', 'testimoni', 'rating',
  'bundling', 'paket', 'package deal',
];

function classifyComplexity(message) {
  const msg = message.toLowerCase();
  const complexity = COMPLEX_KEYWORDS.some(k => msg.includes(k)) ? 'complex' : 'general';
  return complexity;
}

async function route(systemPrompt, history, userMessage, opts = {}) {
  const complexity = opts.complexity || classifyComplexity(userMessage);

  const messages = history.map(h => ({
    role: h.role,
    content: h.content,
  }));

  let reply;
  const start = Date.now();

  if (complexity === 'complex') {
    reply = await gpt4o.chat(systemPrompt, messages, opts);
    logger.info('AI routed to GPT-4o (complex)', { latency: Date.now() - start });
  } else {
    reply = await claude.chatWithFallback(systemPrompt, messages, opts);
    logger.info('AI routed to Claude (general)', { latency: Date.now() - start });
  }

  return { reply, complexity, latency: Date.now() - start };
}

module.exports = { route, classifyComplexity };
