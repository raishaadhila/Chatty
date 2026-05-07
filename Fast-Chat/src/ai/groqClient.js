const Groq = require('groq-sdk');
const config = require('../config');

const groq = new Groq({ apiKey: config.groq.apiKey });

async function chat(systemPrompt, history, userMessage) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 512,
    temperature: 0.5,
  });

  return response.choices[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
}

module.exports = { chat };
