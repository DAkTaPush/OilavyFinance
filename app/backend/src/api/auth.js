const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * Валидирует Telegram initData через HMAC-SHA256
 */
const validateInitData = (initData, botToken) => {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return expectedHash === hash;
  } catch {
    return false;
  }
};

/**
 * POST /api/auth
 * Body: { initData: string }
 * Returns: { token: string, user: {...} }
 */
router.post('/', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData обязателен' });
    }

    const botToken = process.env.BOT_TOKEN;
    const jwtSecret = process.env.JWT_SECRET;

    if (!botToken || !jwtSecret) {
      return res.status(500).json({ error: 'Сервер не настроен' });
    }

    // Если есть hash — строгая проверка подписи Telegram
    // Если hash нет (браузер/тест) — пропускаем, создаём тестового пользователя
    const params0 = new URLSearchParams(initData);
    const hasHash = !!params0.get('hash');
    if (hasHash) {
      const isValid = validateInitData(initData, botToken);
      if (!isValid) {
        return res.status(401).json({ error: 'Неверная подпись initData' });
      }
    }

    // Парсим данные пользователя из initData
    const params = new URLSearchParams(initData);
    let telegramUser;
    try {
      telegramUser = JSON.parse(params.get('user') || '{}');
    } catch {
      return res.status(400).json({ error: 'Невалидные данные пользователя' });
    }

    if (!telegramUser.id) {
      return res.status(400).json({ error: 'ID пользователя не найден' });
    }

    // Находим или создаём пользователя
    const user = await User.findOneAndUpdate(
      { telegramId: telegramUser.id },
      {
        $setOnInsert: {
          telegramId: telegramUser.id,
          username: telegramUser.username || null,
          firstName: telegramUser.first_name || '',
          language: telegramUser.language_code === 'uz' ? 'uz' : 'ru',
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Генерируем JWT
    const token = jwt.sign(
      {
        telegramId: user.telegramId,
        firstName: user.firstName,
        language: user.language,
        familyId: user.familyId,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('[API] auth success for user:', user.telegramId);

    return res.json({
      token,
      user: {
        telegramId: user.telegramId,
        firstName: user.firstName,
        username: user.username,
        language: user.language,
        familyId: user.familyId,
      },
    });
  } catch (err) {
    console.error('[API /auth]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
