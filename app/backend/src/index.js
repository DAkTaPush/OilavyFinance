require('dotenv').config();
const connectDB = require('./db');
const createBot = require('./bot/index');
const createServer = require('./server');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();

    const bot = createBot();
    const app = createServer(bot);

    app.listen(PORT, () => {
      console.log(`[SERVER] Express запущен на порту ${PORT}`);
    });

    if (process.env.NODE_ENV === 'production' && process.env.BACKEND_URL) {
      const webhookUrl = `${process.env.BACKEND_URL}/webhook`;
      try {
        await bot.telegram.setWebhook(webhookUrl);
        console.log('[BOT] Webhook установлен:', webhookUrl);
      } catch (err) {
        console.warn('[BOT] Webhook не удалось установить, запускаем polling:', err.message);
        bot.launch();
      }
    } else {
      await bot.launch();
      console.log('[BOT] Polling запущен');
    }

    const shutdown = (signal) => {
      try { bot.stop(signal); } catch (_) {}
      process.exit(0);
    };
    process.once('SIGINT',  () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    console.error('[START ERROR]', err);
    process.exit(1);
  }
};

start();
