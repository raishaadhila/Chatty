require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
};
