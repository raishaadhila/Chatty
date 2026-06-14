const { getData, queryData } = require('../db/firebase');
const logger = require('../utils/logger');

const TRIGGER_TYPES = ['conversation_ended', 'purchase_detected', 'no_reply', 'cart_abandonment'];

function detectTrigger(lastMessages, triggerType) {
  if (!lastMessages?.length) return false;

  const recent = lastMessages.slice(-4);

  switch (triggerType) {
    case 'conversation_ended': {
      const lastMsg = recent[recent.length - 1];
      const lastTime = lastMsg?.timestamp || 0;
      return (Date.now() - lastTime) > 86400000;
    }

    case 'purchase_detected': {
      return recent.some(m =>
        m.role === 'assistant' && /terima kasih|thank you|order|pesanan|invoice/i.test(m.content)
      );
    }

    case 'no_reply': {
      if (recent.length === 0) return false;
      const lastUser = [...recent].reverse().find(m => m.role === 'user');
      const lastAssistant = [...recent].reverse().find(m => m.role === 'assistant');
      if (!lastUser || !lastAssistant) return false;
      return lastUser.timestamp > lastAssistant.timestamp;
    }

    case 'cart_abandonment': {
      const hasProductInquiry = recent.some(m =>
        m.role === 'user' && /harga|price|berapa|stock|stok|available|tersedia|beli|order/i.test(m.content)
      );
      const hasPurchaseSignal = recent.some(m =>
        m.role === 'user' && /(sudah|udah|oke|done|yes|iya|beli|confirmed|done|checkout)/i.test(m.content)
      );
      return hasProductInquiry && !hasPurchaseSignal;
    }

    default:
      return false;
  }
}

async function findEligibleCustomers(workspaceId, triggerType) {
  const customers = await getData(`/workspaces/${workspaceId}/customers`);
  if (!customers) return [];

  const eligible = [];
  for (const [customerId, data] of Object.entries(customers)) {
    const messages = data.messages;
    if (!messages) continue;

    const msgArray = Object.values(messages);
    if (detectTrigger(msgArray, triggerType)) {
      eligible.push({ customerId, ...data, lastMessages: msgArray });
    }
  }
  return eligible;
}

module.exports = { detectTrigger, findEligibleCustomers, TRIGGER_TYPES };
