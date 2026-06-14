const { Router } = require('express');
const { requireWorkspace, loadWorkspace, enforcePlanLimit } = require('../middleware/workspace');
const { getData, pushData, setData, updateData } = require('../db/firebase');
const { importCSV } = require('../catalog/csv');
const { syncFromSheet } = require('../catalog/sheets');
const { parseInvoiceCommand } = require('../invoices/parser');
const { generateInvoicePDF, deliverInvoice } = require('../invoices/generator');
const { markInvoicePaid } = require('../invoices/reminders');
const { createSequence, toggleSequence } = require('../followups/engine');
const { generateDailyDigest } = require('../reports/daily');
const { generateWeeklyReport } = require('../reports/weekly');
const { checkLimit, incrementUsage } = require('../billing/plans');
const { sendMessage: sendWA } = require('../channels/whatsapp');
const appConfig = require('../config');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) === '.csv') cb(null, true);
    else cb(new Error('Only CSV files allowed'));
  },
});

const router = Router();

router.use(requireWorkspace, loadWorkspace);

router.get('/stats', async (req, res) => {
  try {
    const workspaceData = await getData(`/workspaces/${req.workspaceId}`);
    const wsConfig = workspaceData?.config || {};
    const customers = workspaceData?.customers;
    const invoices = workspaceData?.invoices;

    const customerCount = customers ? Object.keys(customers).length : 0;
    const invoiceCount = invoices ? Object.keys(invoices).length : 0;
    const unpaidInvoices = invoices
      ? Object.values(invoices).filter(i => i.status === 'unpaid').length
      : 0;

    const usage = await getData(`/workspaces/${req.workspaceId}/usage`);

    res.json({
      businessName: wsConfig.businessName,
      plan: wsConfig.plan || 'starter',
      customers: customerCount,
      invoices: invoiceCount,
      unpaidInvoices,
      usage: usage || {},
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customers = await getData(`/workspaces/${req.workspaceId}/customers`);
    if (!customers) return res.json([]);

    const list = Object.entries(customers).map(([id, data]) => ({
      id,
      name: data.name || id,
      channel: data.channel || 'unknown',
      firstContact: data.firstContact,
      messageCount: data.messages ? Object.keys(data.messages).length / 2 : 0,
    }));

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

router.get('/customers/:customerId', async (req, res) => {
  try {
    const customer = await getData(`/workspaces/${req.workspaceId}/customers/${req.params.customerId}`);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get customer' });
  }
});

router.post('/send-message', async (req, res) => {
  try {
    const { customerId, message, channel } = req.body;
    if (!customerId || !message) {
      return res.status(400).json({ error: 'Customer ID and message are required' });
    }

    const actualChannel = channel || (customerId.startsWith('telegram:') ? 'telegram' : 'whatsapp');
    const contact = customerId.replace(`${actualChannel}:`, '');

    if (actualChannel === 'whatsapp') {
      await sendWA(contact, message, req.workspaceId);
    } else {
      const tg = require('../channels/telegram');
      await tg.sendMessage(contact, message);
    }

    await pushData(`/workspaces/${req.workspaceId}/customers/${customerId}/messages`, {
      role: 'assistant',
      content: message,
      channel: actualChannel,
      timestamp: Date.now(),
      manual: true,
    });

    res.json({ sent: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/conversations', async (req, res) => {
  try {
    const customers = await getData(`/workspaces/${req.workspaceId}/customers`);
    if (!customers) return res.json([]);

    const conversations = [];
    for (const [id, data] of Object.entries(customers)) {
      const msgs = data.messages ? Object.values(data.messages).slice(-10) : [];
      if (msgs.length > 0) {
        conversations.push({
          customerId: id,
          customerName: data.name || id,
          channel: data.channel || 'unknown',
          lastMessage: msgs[msgs.length - 1],
          messageCount: Math.floor(msgs.length / 2),
        });
      }
    }

    conversations.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

router.post('/catalog/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

    if (req.plan === 'starter') {
      const catalog = await getData(`/workspaces/${req.workspaceId}/catalog`);
      if (catalog && Object.keys(catalog).length >= 100) {
        return res.status(403).json({ error: 'Catalog limit reached (100 items on Starter plan)' });
      }
    }

    const result = await importCSV(req.workspaceId, req.file.buffer.toString());
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/catalog/sheets', async (req, res) => {
  try {
    const { sheetUrl } = req.body;
    if (!sheetUrl) return res.status(400).json({ error: 'Sheet URL is required' });

    await updateData(`/workspaces/${req.workspaceId}/config`, {
      catalogSheetUrl: sheetUrl,
      catalogSyncEnabled: true,
    });

    const result = await syncFromSheet(req.workspaceId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/catalog', async (req, res) => {
  try {
    const catalog = await getData(`/workspaces/${req.workspaceId}/catalog`);
    const items = catalog ? Object.values(catalog) : [];
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get catalog' });
  }
});

router.post('/invoices/create', async (req, res) => {
  try {
    const { command, customerChannel, customerContact, customerEmail } = req.body;
    if (!command) return res.status(400).json({ error: 'Invoice command is required' });

    const limitCheck = await checkLimit(req.workspaceId, 'invoices');
    if (!limitCheck.allowed) {
      return res.status(403).json({ error: limitCheck.reason, upgradeUrl: '/api/billing/portal' });
    }

    const parsed = parseInvoiceCommand(command);
    if (!parsed) return res.status(400).json({ error: 'Could not parse invoice command. Try: "Invoice for Aisyah: 2x Hoodie Blue M Rp150k, due Friday"' });

    const workspace = await getData(`/workspaces/${req.workspaceId}/config`);
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

    const invoiceData = {
      ...parsed,
      number: invoiceNumber,
      date: Date.now(),
      status: 'unpaid',
      customerChannel: customerChannel || 'whatsapp',
      customerContact: customerContact || '',
      customerEmail: customerEmail || '',
    };

    const pdfBytes = await generateInvoicePDF(req.workspaceId, invoiceData);

    await pushData(`/workspaces/${req.workspaceId}/invoices`, invoiceData);
    await incrementUsage(req.workspaceId, 'invoices');

    if (invoiceData.customerContact || invoiceData.customerEmail) {
      await deliverInvoice(req.workspaceId, invoiceData, pdfBytes, invoiceData.customerChannel, invoiceData.customerContact);
    }

    const pdfBase64 = pdfBytes.toString('base64');

    res.json({
      ...invoiceData,
      pdfBase64: appConfig.nodeEnv === 'development' ? pdfBase64 : undefined,
      message: `Invoice ${invoiceNumber} created and sent to ${parsed.customerName}`,
    });
  } catch (err) {
    logger.error('Invoice creation error', { workspaceId: req.workspaceId, error: err.message });
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.get('/invoices', async (req, res) => {
  try {
    const invoices = await getData(`/workspaces/${req.workspaceId}/invoices`);
    const list = invoices ? Object.entries(invoices).map(([id, data]) => ({ id, ...data })) : [];
    list.sort((a, b) => (b.date || 0) - (a.date || 0));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

router.post('/invoices/:invoiceId/pay', async (req, res) => {
  try {
    await markInvoicePaid(req.workspaceId, req.params.invoiceId);
    res.json({ paid: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark invoice paid' });
  }
});

router.post('/sequences/create', async (req, res) => {
  try {
    const limitCheck = await checkLimit(req.workspaceId, 'followUpSequences');
    if (!limitCheck.allowed) {
      return res.status(403).json({ error: limitCheck.reason, upgradeUrl: '/api/billing/portal' });
    }

    const result = await createSequence(req.workspaceId, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/sequences', async (req, res) => {
  try {
    const sequences = await getData(`/workspaces/${req.workspaceId}/sequences`);
    const list = sequences ? Object.entries(sequences).map(([id, data]) => ({ id, ...data })) : [];
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get sequences' });
  }
});

router.post('/sequences/:seqId/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;
    await toggleSequence(req.workspaceId, req.params.seqId, enabled);
    res.json({ toggled: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle sequence' });
  }
});

router.get('/digest', async (req, res) => {
  try {
    const digest = await generateDailyDigest(req.workspaceId);
    res.json(digest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate digest' });
  }
});

router.get('/weekly-report', async (req, res) => {
  try {
    const report = await generateWeeklyReport(req.workspaceId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const config = await getData(`/workspaces/${req.workspaceId}/config`);
    const safe = { ...config };
    delete safe.stripeCustomerId;
    delete safe.stripeSubscriptionId;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const allowed = ['brandTone', 'primaryLanguage', 'ownerEmail', 'ownerWA',
      'reportSchedule', 'businessName', 'businessAddress', 'businessLogo'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await updateData(`/workspaces/${req.workspaceId}/config`, updates);
    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
