require('dotenv').config();
const connectDB = require('./db');
const createBot = require('./bot/index');
const createServer = require('./server');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // 1. Подключение к MongoDB
    await connectDB();

    // 2. Создаём бота
    const bot = createBot();

    // 3. Создаём Express сервер
    const app = createServer(bot);

    // 4. Запускаем HTTP сервер
    app.listen(PORT, () => {
      console.log(`[SERVER] Express запущен на порту ${PORT}`);
    });

    // 5. Запускаем бота: webhook в production, polling в development
    if (process.env.NODE_ENV === 'production') {
      const webhookUrl = `${process.env.BACKEND_URL}/webhook`;
      await bot.telegram.setWebhook(webhookUrl);
      console.log('[BOT] Webhook установлен:', webhookUrl);
    } else {
      await bot.launch();
      console.log('[BOT] Polling запущен');
    }

    // Graceful stop
    process.once('SIGINT', () => {
      bot.stop('SIGINT');
      process.exit(0);
    });
    process.once('SIGTERM', () => {
      bot.stop('SIGTERM');
      process.exit(0);
    });
  } catch (err) {
    console.error('[START ERROR]', err);
    process.exit(1);
  }
};

start();
