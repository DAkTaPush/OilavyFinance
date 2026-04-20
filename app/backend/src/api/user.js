const express = require('express');
const dayjs = require('dayjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/user/profile — профиль + статистика
 */
router.get('/profile', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const user = await User.findOne({ telegramId }).lean();

    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // Считаем количество транзакций
    const transactionCount = await Transaction.countDocuments({ userId: telegramId });

    // Считаем количество дней с транзакциями
    const daysResult = await Transaction.aggregate([
      { $match: { userId: telegramId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
        },
      },
      { $count: 'days' },
    ]);

    const daysCount = daysResult[0]?.days || 0;

    return res.json({
      user: {
        telegramId: user.telegramId,
        firstName: user.firstName,
        username: user.username,
        language: user.language,
        familyId: user.familyId,
        createdAt: user.createdAt,
      },
      stats: {
        transactions: transactionCount,
        days: daysCount,
      },
    });
  } catch (err) {
    console.error('[API GET /user/profile]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * PATCH /api/user/profile — обновить язык / имя
 * Body: { language?, firstName? }
 */
router.patch('/profile', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const { language, firstName } = req.body;

    const updates = {};
    if (language && ['ru', 'uz'].includes(language)) updates.language = language;
    if (firstName && typeof firstName === 'string') updates.firstName = firstName.trim();

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'Нечего обновлять' });
    }

    const user = await User.findOneAndUpdate(
      { telegramId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    return res.json({ user });
  } catch (err) {
    console.error('[API PATCH /user/profile]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
