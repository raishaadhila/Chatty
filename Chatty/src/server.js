const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');
const { initFirebase } = require('./db/firebase');
const { sendDailyDigestsToAll } = require('./reports/daily');
const { sendWeeklyReportsToAll } = require('./reports/weekly');
const { sendEveningSummariesToAll } = require('./reports/evening');
const { sendPaymentReminders } = require('./invoices/reminders');
const { processNurtureSequence } = require('./onboarding/nurture');
const { syncFromSheet } = require('./catalog/sheets');
const { getData } = require('./db/firebase');
const cron = require('node-cron');

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard/public')));

initFirebase();

const authRoutes = require('./routes/auth');
const webhookRoutes = require('./routes/webhook');
const onboardingRoutes = require('./routes/onboarding');
const billingRoutes = require('./routes/billing');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chatty',
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

const frontendDist = path.join(__dirname, '../frontend/dist');
if (config.nodeEnv === 'production' && require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard/public/index.html'));
  });
}

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

if (config.nodeEnv !== 'test') {
  cron.schedule('0 8 * * *', () => {
    logger.info('Running daily digest cron');
    sendDailyDigestsToAll();
  }, { timezone: 'Asia/Jakarta' });

  cron.schedule('0 8 * * 1', () => {
    logger.info('Running weekly report cron');
    sendWeeklyReportsToAll();
  }, { timezone: 'Asia/Jakarta' });

  cron.schedule('0 9 * * *', () => {
    logger.info('Running payment reminder cron');
    sendPaymentReminders();
  }, { timezone: 'Asia/Jakarta' });

  cron.schedule('0 21 * * *', () => {
    logger.info('Running evening summary cron');
    sendEveningSummariesToAll();
  }, { timezone: 'Asia/Jakarta' });

  cron.schedule('0 10 * * *', () => {
    logger.info('Running nurture sequence cron');
    processNurtureSequence();
  }, { timezone: 'Asia/Jakarta' });

  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running Google Sheets catalog sync');
    const workspaces = await getData('/workspaces');
    if (!workspaces) return;
    for (const workspaceId of Object.keys(workspaces)) {
      const config = await getData(`/workspaces/${workspaceId}/config`);
      if (config?.catalogSyncEnabled && config?.catalogSheetUrl) {
        await syncFromSheet(workspaceId).catch(err =>
          logger.error('Auto sheet sync error', { workspaceId, error: err.message })
        );
      }
    }
  }, { timezone: 'Asia/Jakarta' });
}

app.listen(config.port, () => {
  logger.info(`Chatty server running on port ${config.port} (${config.nodeEnv})`);
  logger.info(`Dashboard: ${config.dashboardUrl}/dashboard`);
});

module.exports = app;
