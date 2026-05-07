const queries = require('../db/queries');

function formatPrice(price) {
  return `Rp ${Number(price).toLocaleString('id-ID')}`;
}

function buildContext(userMessage) {
  const msg = userMessage.toLowerCase();
  const parts = [];

  // Product search
  const found = queries.products.search(userMessage);
  if (found.length > 0) {
    const lines = found.map(p => {
      const s = queries.stock.getByProductId(p.id);
      const shade = p.shade ? ` (${p.shade})` : '';
      return `- [${p.sku}] ${p.name}${shade} | ${formatPrice(p.price)} | ${s?.status || 'Unknown'} (${s?.quantity ?? '?'} ${s?.unit ?? 'pcs'}) | ${p.description}`;
    });
    parts.push(`MATCHING PRODUCTS:\n${lines.join('\n')}`);
  }

  // Full catalog
  if (/catalog|produk|product|menu|list|semua|all|apa saja|koleksi/i.test(msg)) {
    const all = queries.stock.getAll();
    const byCategory = {};
    all.forEach(p => {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      const shade = p.shade ? ` - ${p.shade}` : '';
      byCategory[p.category].push(`  • ${p.name}${shade} | ${formatPrice(p.price)} | ${p.status}`);
    });
    const lines = Object.entries(byCategory).map(([cat, items]) => `${cat}:\n${items.join('\n')}`);
    parts.push(`FULL PRODUCT CATALOG:\n${lines.join('\n\n')}`);
  }

  // Stock check
  if (/stock|stok|tersedia|available|ready|habis|kosong/i.test(msg)) {
    const all = queries.stock.getAll();
    const lines = all.map(p => {
      const shade = p.shade ? ` (${p.shade})` : '';
      return `- ${p.name}${shade}: ${p.quantity} ${p.unit} [${p.status}]`;
    });
    parts.push(`CURRENT STOCK:\n${lines.join('\n')}`);
  }

  // Promotions
  if (/promo|diskon|discount|voucher|kode|code|sale|murah|hemat/i.test(msg)) {
    const promos = queries.promotions.getActive();
    const lines = promos.map(p => {
      const val = p.discount_type === 'percent' ? `${p.discount_value}% off` :
                  p.discount_type === 'fixed' ? `Rp ${Number(p.discount_value).toLocaleString('id-ID')} off` : 'Free shipping';
      const min = p.min_purchase > 0 ? ` (min. ${formatPrice(p.min_purchase)})` : '';
      return `- Code: ${p.code} | ${p.description} | ${val}${min} | Valid until: ${p.valid_until || 'No expiry'}`;
    });
    parts.push(`ACTIVE PROMOTIONS:\n${lines.join('\n')}`);
  }

  // FAQ search
  const faqs = queries.faq.search(userMessage);
  if (faqs.length > 0) {
    const lines = faqs.slice(0, 3).map(f => `Q: ${f.question}\nA: ${f.answer}`);
    parts.push(`RELEVANT FAQ:\n${lines.join('\n\n')}`);
  }

  return parts.join('\n\n');
}

const SYSTEM_PROMPT = `You are a friendly and knowledgeable customer service assistant for an Emina Cosmetics reseller shop.

About Emina:
- Indonesian cosmetics brand by PT Paragon Technology & Innovation
- Targets teens and young adults (15-25 years old)
- Affordable, fun, cruelty-free, BPOM certified, Halal MUI certified
- Product lines: Face (foundation, powder, blush), Lips (liquid lipstick, gloss, balm), Eyes (mascara, eyeshadow, eyeliner, brow), Skincare (toner, serum, moisturizer, face wash, mask)

Your role:
- Help customers find the right Emina products for their needs
- Provide accurate pricing, stock availability, and product info
- Explain promotions and how to apply discount codes
- Guide customers through the ordering process
- Answer questions about shipping, payment, and policies
- Give skincare/makeup recommendations based on skin type or concern
- Always respond in the same language the customer uses (Indonesian or English)
- Be warm, friendly, and use a youthful tone that matches the Emina brand
- Format prices in Rupiah (Rp)
- If a product is out of stock, suggest similar alternatives

When context data is provided, use it for accurate answers. Never make up prices or stock numbers.`;

module.exports = { buildContext, SYSTEM_PROMPT };
