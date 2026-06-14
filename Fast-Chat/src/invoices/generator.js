const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { getData, pushData, setData } = require('../db/firebase');
const { sendMessage: sendWA } = require('../channels/whatsapp');
const { sendMessage: sendTG } = require('../channels/telegram');
const email = require('../utils/email');
const logger = require('../utils/logger');

function formatCurrency(amount) {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

async function generatePDF(invoiceData, workspaceConfig) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const businessName = workspaceConfig.businessName || 'Business';
  const businessAddress = workspaceConfig.businessAddress || '';
  const logo = workspaceConfig.businessLogo || null;

  const margin = 50;
  let y = height - margin;

  if (logo) {
    try {
      const logoImage = await doc.embedPng(logo);
      page.drawImage(logoImage, { x: margin, y: y - 60, width: 120, height: 60 });
    } catch {}
  }

  page.drawText(businessName, {
    x: margin,
    y: y - 20,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 50;

  if (businessAddress) {
    page.drawText(businessAddress, {
      x: margin, y, size: 10, font, color: rgb(0.4, 0.4, 0.4),
    });
    y -= 30;
  }

  page.drawText(`INVOICE #${invoiceData.number}`, {
    x: margin, y, size: 16, font: boldFont, color: rgb(0.2, 0.2, 0.2),
  });
  y -= 20;

  page.drawText(`Date: ${new Date(invoiceData.date).toLocaleDateString('id-ID')}`, {
    x: margin, y, size: 10, font, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 15;

  page.drawText(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString('id-ID')}`, {
    x: margin, y, size: 10, font, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 15;

  page.drawText(`Customer: ${invoiceData.customerName}`, {
    x: margin, y, size: 10, font, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 30;

  y -= 10;

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 15;

  const headers = ['Item', 'Qty', 'Price', 'Total'];
  const colX = [margin, 350, 420, 500];
  headers.forEach((h, i) => {
    page.drawText(h, { x: colX[i], y, size: 10, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
  });
  y -= 10;

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 15;

  for (const line of invoiceData.lines || []) {
    const total = line.quantity * line.unitPrice;
    page.drawText(line.description, { x: colX[0], y, size: 10, font });
    page.drawText(String(line.quantity), { x: colX[1], y, size: 10, font });
    page.drawText(formatCurrency(line.unitPrice), { x: colX[2], y, size: 10, font });
    page.drawText(formatCurrency(total), { x: colX[3], y, size: 10, font });
    y -= 18;
  }

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 25;

  page.drawText(`Total: ${formatCurrency(invoiceData.total)}`, {
    x: width - margin - 150, y, size: 14, font: boldFont, color: rgb(0.1, 0.1, 0.1),
  });

  return Buffer.from(await doc.save());
}

async function generateInvoicePDF(workspaceId, invoiceData) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  const pdfBytes = await generatePDF(invoiceData, workspace || {});

  logger.info('Invoice PDF generated', { workspaceId, invoiceNumber: invoiceData.number });
  return pdfBytes;
}

async function deliverInvoice(workspaceId, invoiceData, pdfBytes, customerChannel, customerContact) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  const businessName = workspace?.businessName || 'Business';

  const caption = `📄 *Invoice #${invoiceData.number}*\nFrom: ${businessName}\nTotal: ${formatCurrency(invoiceData.total)}\nDue: ${new Date(invoiceData.dueDate).toLocaleDateString('id-ID')}`;

  if (customerChannel === 'whatsapp' && customerContact) {
    const wa = require('../channels/whatsapp');
    await wa.sendMediaMessage(customerContact, 'document', `data:application/pdf;base64,${pdfBytes.toString('base64')}`, `Invoice-${invoiceData.number}.pdf`, workspaceId)
      .catch(() => sendWA(customerContact, caption, workspaceId));
  }

  if (customerChannel === 'telegram' && customerContact) {
    const tg = require('../channels/telegram');
    await tg.sendDocument(customerContact, `data:application/pdf;base64,${pdfBytes.toString('base64')}`, caption)
      .catch(() => sendTG(customerContact, caption));
  }

  if (invoiceData.customerEmail) {
    await email.send({
      to: invoiceData.customerEmail,
      subject: `📄 Invoice #${invoiceData.number} from ${businessName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Invoice #${invoiceData.number}</h2>
          <p>Hi ${invoiceData.customerName},</p>
          <p>You have a new invoice from <b>${businessName}</b>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;border-bottom:1px solid #eee">Amount</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right"><b>${formatCurrency(invoiceData.total)}</b></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee">Due Date</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${new Date(invoiceData.dueDate).toLocaleDateString('id-ID')}</td></tr>
          </table>
          <p style="color:#999;font-size:12px">Sent by Chatty — AI Customer Service Platform</p>
        </div>
      `,
    }).catch(() => {});
  }

  logger.info('Invoice delivered', { workspaceId, invoiceNumber: invoiceData.number, customerChannel });
}

module.exports = { generatePDF, generateInvoicePDF, deliverInvoice, formatCurrency };
