const jwt = require('jsonwebtoken');

/**
 * JWT middleware — проверяет Authorization: Bearer <token>
 * Добавляет req.user = { telegramId, firstName, language, familyId }
 */
const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен отсутствует' });
    }

    const token = header.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET не задан');

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истёк' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный токен' });
    }
    console.error('[AUTH MIDDLEWARE]', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = authMiddleware;
