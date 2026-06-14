const INVOICE_PATTERN = /invoice\s+(?:for|to|untuk)?\s*:?\s*(.+?)(?:\s+due\s+(.+?))?(?:\s+total\s+(.+?))?$/i;
const LINE_PATTERN = /(\d+)?x?\s*(.+?)\s+(?:Rp|IDR|rp)?\s*([\d,.]+)\s*k?/gi;

function parseInvoiceCommand(text) {
  const match = text.match(INVOICE_PATTERN);
  if (!match) return null;

  const customerName = match[1]?.trim();
  const dueDateStr = match[2]?.trim();
  const totalStr = match[3]?.trim();

  const lines = [];
  let lineMatch;
  while ((lineMatch = LINE_PATTERN.exec(text)) !== null) {
    lines.push({
      quantity: parseInt(lineMatch[1]) || 1,
      description: lineMatch[2].trim(),
      unitPrice: parseFloat(lineMatch[3].replace(/[,.]/g, '')) || 0,
    });
  }

  let dueDate = null;
  if (dueDateStr) {
    const parsed = new Date(dueDateStr);
    if (!isNaN(parsed.getTime())) {
      dueDate = parsed;
    } else {
      const days = parseInt(dueDateStr);
      if (!isNaN(days)) {
        dueDate = new Date(Date.now() + days * 86400000);
      }
    }
  }

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  return {
    customerName,
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000),
    lines,
    total,
    currency: 'IDR',
    originalText: text,
  };
}

module.exports = { parseInvoiceCommand };
