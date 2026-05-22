const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/cards — список карт
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.telegramId }).sort({ createdAt: 1 });
    res.json({ cards });
  } catch (err) {
    console.error('[API CARDS GET]', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/cards — добавить карту (макс 5)
router.post('/', async (req, res) => {
  try {
    const { cardNumber, holderName, balance, currency } = req.body;
    if (!cardNumber || !holderName || balance === undefined) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const count = await Card.countDocuments({ userId: req.user.telegramId });
    if (count >= 5) {
      return res.status(400).json({ error: 'Максимум 5 карт' });
    }

    await Card.updateMany({ userId: req.user.telegramId }, { isActive: false });
    await Card.create({
      userId: req.user.telegramId,
      cardNumber,
      holderName,
      balance: Number(balance),
      currency: currency || 'sum',
      isActive: true,
    });
    const cards = await Card.find({ userId: req.user.telegramId }).sort({ createdAt: 1 });
    res.json({ cards });
  } catch (err) {
    console.error('[API CARDS POST]', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/cards/:id/activate — сделать карту активной
router.patch('/:id/activate', async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user.telegramId });
    if (!card) return res.status(404).json({ error: 'Карта не найдена' });

    await Card.updateMany({ userId: req.user.telegramId }, { isActive: false });
    await Card.findByIdAndUpdate(req.params.id, { isActive: true });

    const cards = await Card.find({ userId: req.user.telegramId }).sort({ createdAt: 1 });
    res.json({ cards });
  } catch (err) {
    console.error('[API CARDS ACTIVATE]', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/cards/:id/balance — обновить баланс вручную
router.patch('/:id/balance', async (req, res) => {
  try {
    const { balance } = req.body;
    if (balance === undefined) return res.status(400).json({ error: 'balance required' });

    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.telegramId },
      { balance: Number(balance) },
      { new: true }
    );
    if (!card) return res.status(404).json({ error: 'Карта не найдена' });
    res.json({ card });
  } catch (err) {
    console.error('[API CARDS BALANCE]', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/cards/:id — удалить карту
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user.telegramId });
    if (!card) return res.status(404).json({ error: 'Карта не найдена' });

    const wasActive = card.isActive;
    await Card.deleteOne({ _id: req.params.id });

    if (wasActive) {
      const next = await Card.findOne({ userId: req.user.telegramId }).sort({ createdAt: -1 });
      if (next) await Card.findByIdAndUpdate(next._id, { isActive: true });
    }

    const cards = await Card.find({ userId: req.user.telegramId }).sort({ createdAt: 1 });
    res.json({ cards });
  } catch (err) {
    console.error('[API CARDS DELETE]', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
