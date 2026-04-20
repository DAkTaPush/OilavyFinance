const express = require('express');
const dayjs = require('dayjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/analytics
 * Query: ?month=4&year=2026&type=expense|income
 * Returns: { total, byCategory, byDay, byMember }
 */
router.get('/', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const now = dayjs();
    const month = parseInt(req.query.month) || now.month() + 1;
    const year = parseInt(req.query.year) || now.year();
    const type = req.query.type || 'expense';

    const user = await User.findOne({ telegramId }).lean();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Семейная логика
    const baseQuery = user.familyId
      ? { familyId: user.familyId }
      : { userId: telegramId };

    const query = {
      ...baseQuery,
      type,
      date: { $gte: startDate, $lte: endDate },
    };

    const transactions = await Transaction.find(query).lean();

    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // По категориям
    const categoryMap = {};
    for (const tx of transactions) {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
    }
    const byCategory = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // По дням
    const dayMap = {};
    for (const tx of transactions) {
      const d = dayjs(tx.date).format('YYYY-MM-DD');
      dayMap[d] = (dayMap[d] || 0) + tx.amount;
    }
    const byDay = Object.entries(dayMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // По участникам семьи (если есть familyId)
    let byMember = [];
    if (user.familyId) {
      const memberMap = {};
      const memberNames = {};
      for (const tx of transactions) {
        memberMap[tx.userId] = (memberMap[tx.userId] || 0) + tx.amount;
      }

      const memberIds = Object.keys(memberMap).map(Number);
      const members = await User.find({ telegramId: { $in: memberIds } })
        .select('telegramId firstName')
        .lean();

      for (const m of members) {
        memberNames[m.telegramId] = m.firstName || `User ${m.telegramId}`;
      }

      byMember = Object.entries(memberMap).map(([userId, amount]) => ({
        userId: Number(userId),
        firstName: memberNames[userId] || `User ${userId}`,
        amount,
      }));
    }

    return res.json({ total, byCategory, byDay, byMember });
  } catch (err) {
    console.error('[API GET /analytics]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
