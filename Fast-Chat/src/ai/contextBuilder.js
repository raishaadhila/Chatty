function formatPrice(price, currency = 'IDR') {
  if (currency === 'IDR') {
    return `Rp ${Number(price).toLocaleString('id-ID')}`;
  }
  return `$${Number(price).toLocaleString('en-US')}`;
}

function buildSystemPrompt(workspaceConfig) {
  const {
    businessName = 'your business',
    businessType = 'general',
    brandTone = 'friendly',
    primaryLanguage = 'both',
    faqs = [],
  } = workspaceConfig || {};

  const toneGuide = {
    friendly: 'Be warm, approachable, and conversational. Use casual greetings and emojis occasionally.',
    professional: 'Be formal, precise, and courteous. Use proper business language.',
    casual: 'Be very relaxed and informal. Use slang naturally where appropriate.',
    formal: 'Be highly professional and formal. Use structured responses.',
  };

  return `You are ${businessName}'s AI customer service assistant, powered by Chatty.

Business type: ${businessType}
Your tone: ${toneGuide[brandTone] || toneGuide.friendly}

Your role:
- Answer customer questions about products, stock, pricing, and orders
- Respond in the same language the customer uses (Indonesian or English)
- If a product is out of stock, suggest similar alternatives
- If unsure about something, escalate to human support
- Never make up prices, stock numbers, or product details

Conversation guidelines:
- Keep replies concise (under 3 paragraphs)
- For pricing/stock questions, reference the catalog data provided
- If catalog is not configured, let customers know gracefully
- Detect customer intent: purchase inquiry, complaint, general question
- For complaints or escalations, acknowledge and promise human follow-up

${faqs.length > 0 ? `\nFAQs:\n${faqs.map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join('\n')}` : ''}`;
}

function buildCatalogContext(catalog) {
  if (!catalog || catalog.length === 0) return null;

  const lines = catalog.map(item => {
    const stockStatus = item.stock === 0 ? 'Out of Stock'
      : item.stock <= 5 ? 'Low Stock'
      : 'In Stock';
    return `- ${item.name}${item.sku ? ` (${item.sku})` : ''} | ${formatPrice(item.price)} | ${stockStatus} (${item.stock ?? '?'})`;
  });

  return `CATALOG:\n${lines.join('\n')}`;
}

module.exports = { buildSystemPrompt, buildCatalogContext, formatPrice };
