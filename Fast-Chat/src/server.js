const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');
const { startBot } = require('./bot/telegram');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', bot: 'telegram-polling' }));

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Telegram bot
startBot();

app.listen(config.port, () => {
  logger.info(`Fast-Chat server running on port ${config.port}`);
});

module.exports = app;
