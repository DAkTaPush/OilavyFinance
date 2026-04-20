const express = require('express');
const cors = require('cors');

const authRouter = require('./api/auth');
const transactionsRouter = require('./api/transactions');
const analyticsRouter = require('./api/analytics');
const familyRouter = require('./api/family');
const userRouter = require('./api/user');

const createServer = (bot) => {
  const app = express();

  // CORS — разрешаем запросы от frontend на Render
  app.use(
    cors({
      origin: (origin, cb) => cb(null, true),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API роуты
  app.use('/api/auth', authRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/family', familyRouter);
  app.use('/api/user', userRouter);

  // Webhook для Telegram (только в production)
  if (bot && process.env.NODE_ENV === 'production') {
    app.use(bot.webhookCallback('/webhook'));
  }

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  });

  return app;
};

module.exports = createServer;
