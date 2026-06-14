const { getData, updateData } = require('../db/firebase');
const { sendMessage: sendWA } = require('../channels/whatsapp');
const { sendMessage: sendTG } = require('../channels/telegram');
const logger = require('../utils/logger');

async function sendPaymentReminders() {
  const workspaces = await getData('/workspaces');
  if (!workspaces) return;

  for (const [workspaceId, ws] of Object.entries(workspaces)) {
    const config = ws.config;
    if (!config?.ownerWA && !config?.ownerEmail) continue;

    const invoices = await getData(`/workspaces/${workspaceId}/invoices`);
    if (!invoices) continue;

    const now = Date.now();

    for (const [invoiceId, invoice] of Object.entries(invoices)) {
      if (invoice.status !== 'unpaid') continue;
      if (!invoice.dueDate) continue;

      const dueDate = new Date(invoice.dueDate).getTime();
      const dayBeforeDue = dueDate - 86400000;
      const isDueDate = Math.abs(now - dueDate) < 86400000;
      const isDayBefore = Math.abs(now - dayBeforeDue) < 86400000;

      if (!isDayBefore && !isDueDate) continue;

      const message = isDueDate
        ? `⚠️ *Payment Due Today*\nInvoice #${invoice.number || invoiceId} for ${invoice.customerName || 'customer'} is due *today*.\nAmount: ${invoice.totalFormatted || `Rp ${Number(invoice.total).toLocaleString('id-ID')}`}\n\nPlease follow up with the customer.`
        : `📋 *Payment Reminder*\nInvoice #${invoice.number || invoiceId} for ${invoice.customerName || 'customer'} is due *tomorrow*.\nAmount: ${invoice.totalFormatted || `Rp ${Number(invoice.total).toLocaleString('id-ID')}`}`;

      if (config.ownerWA) {
        await sendWA(config.ownerWA, message, workspaceId).catch(err =>
          logger.error('Reminder WA send error', { workspaceId, error: err.message })
        );
      }

      if (config.ownerEmail) {
        const email = require('../utils/email');
        await email.send({
          to: config.ownerEmail,
          subject: isDueDate ? '⚠️ Invoice Due Today' : '📋 Payment Reminder',
          text: message.replace(/\*/g, ''),
        }).catch(err =>
          logger.error('Reminder email send error', { workspaceId, error: err.message })
        );
      }

      logger.info('Payment reminder sent', { workspaceId, invoiceId, type: isDueDate ? 'due' : 'day-before' });
    }
  }
}

async function markInvoicePaid(workspaceId, invoiceId) {
  await updateData(`/workspaces/${workspaceId}/invoices/${invoiceId}`, {
    status: 'paid',
    paidAt: Date.now(),
  });
  logger.info('Invoice marked paid', { workspaceId, invoiceId });
}

module.exports = { sendPaymentReminders, markInvoicePaid };
