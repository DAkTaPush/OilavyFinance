const express = require('express');
const { customAlphabet } = require('nanoid');
const User = require('../models/User');
const Family = require('../models/Family');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

/**
 * GET /api/family — информация о своей семье
 */
router.get('/', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const user = await User.findOne({ telegramId }).lean();

    if (!user || !user.familyId) {
      return res.json({ family: null });
    }

    const family = await Family.findById(user.familyId).lean();
    if (!family) return res.json({ family: null });

    // Загружаем имена участников
    const members = await User.find({ telegramId: { $in: family.members } })
      .select('telegramId firstName username')
      .lean();

    return res.json({ family: { ...family, membersData: members } });
  } catch (err) {
    console.error('[API GET /family]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/family/create — создать семью
 */
router.post('/create', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    let code;
    let attempts = 0;
    do {
      code = generateCode();
      attempts++;
      if (attempts > 10) throw new Error('Не удалось сгенерировать код');
    } while (await Family.findOne({ code }));

    const family = await Family.create({
      code,
      ownerId: telegramId,
      members: [telegramId],
    });

    await User.updateOne({ telegramId }, { familyId: family._id });

    console.log('[API] family created:', code, 'by user:', telegramId);

    return res.status(201).json({ family });
  } catch (err) {
    console.error('[API POST /family/create]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/family/join — вступить в семью
 * Body: { code: string }
 */
router.post('/join', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const { code } = req.body;

    if (!code) return res.status(400).json({ error: 'Код семьи обязателен' });

    const family = await Family.findOne({ code: code.toUpperCase() });
    if (!family) return res.status(404).json({ error: 'Семья не найдена' });

    if (family.members.includes(telegramId)) {
      return res.status(400).json({ error: 'Вы уже в этой семье' });
    }

    await Family.updateOne(
      { _id: family._id },
      { $addToSet: { members: telegramId } }
    );

    await User.updateOne({ telegramId }, { familyId: family._id });

    console.log('[API] user', telegramId, 'joined family:', code);

    return res.json({ success: true, family });
  } catch (err) {
    console.error('[API POST /family/join]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
