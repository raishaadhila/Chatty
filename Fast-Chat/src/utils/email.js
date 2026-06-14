const sgMail = require('@sendgrid/mail');
const config = require('../config');
const logger = require('../utils/logger');

let initialized = false;

function init() {
  if (initialized) return;
  if (config.sendgrid.apiKey) {
    sgMail.setApiKey(config.sendgrid.apiKey);
    initialized = true;
  }
}

async function send({ to, subject, text, html }) {
  init();

  if (!initialized) {
    logger.warn('SendGrid not configured — email not sent', { to, subject });
    return null;
  }

  try {
    const msg = {
      to,
      from: { email: 'noreply@chatty.app', name: 'Chatty' },
      subject,
      text,
      html: html || text,
    };
    const response = await sgMail.send(msg);
    logger.info('Email sent', { to, subject, statusCode: response[0]?.statusCode });
    return response;
  } catch (err) {
    logger.error('Email send error', { to, subject, error: err.response?.body || err.message });
    throw err;
  }
}

module.exports = { send };
