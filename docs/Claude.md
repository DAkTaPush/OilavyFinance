# Claude.md — Инструкции для Claude Code

## Кто ты и что делаешь

Ты пишешь код для проекта **OilavyFinance** — семейного финансового Telegram-бота с Mini App.

Перед тем как писать любой код, прочитай эти файлы в порядке:
1. `docs/TZ.md` — полное техническое задание
2. `docs/ARCHITECTURE.md` — архитектура системы
3. `docs/PROJECT_STRUCTURE.md` — структура папок
4. `docs/BACKEND.md` — детали backend
5. `docs/FRONTEND.md` — детали frontend
6. `docs/theme.md` — цвета и стили

## Проект

**Название:** OilavyFinance
**Telegram бот:** @OilavyFinanceBot
**Описание:** Личный и семейный финансовый помощник. Записывает расходы и доходы текстом. Имеет Mini App с 4 экранами.

## Стек

| Часть     | Технологии                                      |
|-----------|-------------------------------------------------|
| Backend   | Node.js, Telegraf v4, Express, Mongoose, JWT    |
| Frontend  | React, Vite, Axios, @twa-dev/sdk                |
| База      | MongoDB Atlas                                   |
| Деплой    | Render.com                                      |

## Языки

Бот работает на двух языках. При /start пользователь выбирает язык:
- 🇷🇺 Русский
- 🇺🇿 O'zbek tili

Все тексты бота берутся из `src/locales/ru.js` или `src/locales/uz.js`.
**Никаких хардкоженных текстов в handlers — только через locales.**

## Структура папок

```
OILAVYFINANCE/
├── app/
│   ├── backend/     ← Node.js бот + Express API
│   └── frontend/    ← React Mini App
├── docs/            ← вся документация (не трогай)
└── README.md
```

## Правила написания кода

### Общие
- Используй `async/await`, не `.then().catch()`
- Все ошибки оборачивай в `try/catch`
- Логируй важные события: `console.log('[BOT] user started:', userId)`
- Не используй `var`, только `const` и `let`
- Файлы называй в `camelCase`, компоненты React в `PascalCase`

### Backend
- Каждый handler в отдельном файле
- Модели только в `src/models/`
- Вся бизнес-логика в handlers, не в моделях
- API роуты регистрируй в `src/server.js`
- Middleware для JWT в `src/middleware/auth.js`

### Frontend
- Каждая страница в `src/pages/`
- Переиспользуемые компоненты в `src/components/`
- Все цвета через CSS переменные из `index.css` (см. `docs/theme.md`)
- **Никаких inline стилей с хардкоженными цветами**
- API вызовы только через axios instance из `src/api/axios.js`
- Инициализация Telegram WebApp в `src/hooks/useTelegram.js`

### Mini App специфика
```js
// Всегда инициализировать в начале
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Получить данные пользователя
const user = tg.initDataUnsafe?.user;

// Аутентификация
const { data } = await axios.post('/api/auth', { initData: tg.initData });
localStorage.setItem('token', data.token); // нет, используй state/context
```

## Дизайн Mini App

**Тема:** тёмная, фиолетовая. Строго следуй `docs/theme.md`.

**4 экрана (вкладки):**
1. **Главная** — сегодняшние расходы/доходы, 3 кнопки действий, последние транзакции
2. **Транзакция** — поиск, фильтры, список всех транзакций, форма добавления
3. **Аналитика** — месяц/год, переключатель, календарь, динамика по пользователям
4. **Профиль** — аватар, статистика, настройки, поддержка

**Нижняя навигация** всегда видна. Активная вкладка — белый цвет, остальные — серые.

## База данных

Три коллекции: `users`, `families`, `transactions`.
Подробные схемы в `docs/BACKEND.md` и `docs/TZ.md`.

**Важно:** транзакции принадлежат пользователю (userId) И семье (familyId).
Если пользователь не в семье — familyId = null, транзакции видны только ему.

## API аутентификация

Mini App отправляет `initData` от Telegram.
Backend валидирует через HMAC-SHA256 с BOT_TOKEN.
Возвращает JWT. Frontend хранит JWT в памяти (React Context или useState).

## Что реализовать в первую очередь

### Фаза 1 — Backend бот (приоритет)
- [ ] Подключение к MongoDB
- [ ] Модели User, Family, Transaction
- [ ] /start с выбором языка
- [ ] Парсер текстовых сообщений → транзакция
- [ ] /create и /join для семьи
- [ ] /report — текстовый отчёт

### Фаза 2 — REST API
- [ ] POST /api/auth
- [ ] CRUD /api/transactions
- [ ] GET /api/analytics
- [ ] /api/family endpoints

### Фаза 3 — Frontend Mini App
- [ ] Инициализация Telegram WebApp
- [ ] Аутентификация через API
- [ ] Экран Главная
- [ ] Экран Транзакции + форма добавления
- [ ] Экран Аналитика
- [ ] Экран Профиль
- [ ] Нижняя навигация

## Частые ошибки — избегай

1. **Не используй localStorage** для JWT в Mini App — используй React Context
2. **Не хардкодь тексты** — всё через locales
3. **Не смешивай** логику бота и API в одном файле
4. **Webhook в production, polling в development** — определяй через NODE_ENV
5. **CORS** — настрой в Express для домена frontend на Render
6. **Суммы** — всегда храни как Number в копейках или целых сумах, не как String
7. **Даты** — используй dayjs, не нативный Date для форматирования

## Пример правильного handler'а

```js
// handlers/expense.js
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { parseTransaction } = require('../utils/parser');

module.exports = async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) return ctx.reply('Сначала введите /start');

    const t = require(`../locales/${user.language}`);
    const parsed = parseTransaction(ctx.message.text);

    if (!parsed) return; // не похоже на транзакцию — игнорируем

    await Transaction.create({
      userId: user.telegramId,
      familyId: user.familyId,
      ...parsed,
    });

    await ctx.reply(t.expenseSaved(parsed.amount, parsed.category));
  } catch (err) {
    console.error('[EXPENSE HANDLER]', err);
    await ctx.reply('Произошла ошибка. Попробуйте снова.');
  }
};
```