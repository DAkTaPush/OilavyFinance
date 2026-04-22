const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/transactions
 * Query: ?type=expense|income|transfer&month=4&year=2026&search=текст&limit=20&page=1
 */
router.get('/', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const { type, month, year, search, limit = 20, page = 1 } = req.query;

    const user = await User.findOne({ telegramId }).lean();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // Семейная логика: если есть familyId — показываем транзакции всей семьи
    const baseQuery = user.familyId
      ? { familyId: user.familyId }
      : { userId: telegramId };

    if (type) baseQuery.type = type;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      baseQuery.date = { $gte: startDate, $lte: endDate };
    }

    if (search) {
      baseQuery.description = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(baseQuery);
    const transactions = await Transaction.find(baseQuery)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('[API GET /transactions]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/transactions
 * Body: { type, amount, category, description, date }
 */
router.post('/', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ error: 'type, amount, category обязательны' });
    }

    if (!['expense', 'income', 'transfer'].includes(type)) {
      return res.status(400).json({ error: 'Неверный тип транзакции' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
    }

    const user = await User.findOne({ telegramId }).lean();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const transaction = await Transaction.create({
      userId: telegramId,
      familyId: user.familyId || null,
      type,
      amount,
      category,
      description: description || '',
      date: date ? new Date(date) : new Date(),
    });

    // Обновляем баланс активной карты
    const activeCard = await Card.findOne({ userId: telegramId, isActive: true });
    if (activeCard) {
      let delta = 0;
      if (type === 'expense')  delta = -amount;
      if (type === 'income')   delta = +amount;
      if (delta !== 0) {
        await Card.findByIdAndUpdate(activeCard._id, { $inc: { balance: delta } });
      }
    }

    console.log('[API] transaction created:', transaction._id, 'user:', telegramId);

    return res.status(201).json(transaction);
  } catch (err) {
    console.error('[API POST /transactions]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * DELETE /api/transactions/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: telegramId,
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Транзакция не найдена' });
    }

    await Transaction.deleteOne({ _id: id });

    // Возвращаем баланс карты при удалении
    const activeCard = await Card.findOne({ userId: telegramId, isActive: true });
    if (activeCard) {
      let delta = 0;
      if (transaction.type === 'expense') delta = +transaction.amount;
      if (transaction.type === 'income')  delta = -transaction.amount;
      if (delta !== 0) {
        await Card.findByIdAndUpdate(activeCard._id, { $inc: { balance: delta } });
      }
    }

    console.log('[API] transaction deleted:', id, 'user:', telegramId);

    return res.json({ success: true });
  } catch (err) {
    console.error('[API DELETE /transactions]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
