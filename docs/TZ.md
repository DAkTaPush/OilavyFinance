# TZ.md — Техническое задание OilavyFinance

## 1. Общая информация

| Параметр       | Значение                        |
|----------------|---------------------------------|
| Название       | OilavyFinance                   |
| Telegram бот   | @OilavyFinanceBot               |
| Языки          | Русский (RU), Узбекский (UZ)    |
| Платформа      | Telegram Bot + Telegram Mini App|
| Деплой         | Render.com + MongoDB Atlas      |

**Описание:**
Личный и семейный финансовый помощник в Telegram. Пользователь записывает расходы и доходы текстом прямо в чат. Есть полноценное Mini App с 4 экранами: Главная, Транзакции, Аналитика, Профиль. Поддерживает семейный режим — несколько человек ведут общий бюджет.

---

## 2. Стек технологий

### Backend (`app/backend`)
- Node.js 20+
- Telegraf v4 — Telegram бот
- Express.js — REST API для Mini App
- Mongoose — работа с MongoDB
- jsonwebtoken — JWT аутентификация
- nanoid — генерация кодов семьи
- dayjs — работа с датами
- dotenv — переменные окружения

### Frontend (`app/frontend`)
- React 18 + Vite
- React Router v6
- Axios — HTTP запросы
- @twa-dev/sdk — типы Telegram WebApp
- Чистый CSS с переменными (без UI библиотек)

### База данных
- MongoDB Atlas (облако)
- 3 коллекции: `users`, `families`, `transactions`

---

## 3. Переменные окружения

Файл: `app/backend/.env`

```env
BOT_TOKEN=           # токен от @BotFather
MONGODB_URI=         # MongoDB Atlas connection string
MINI_APP_URL=        # URL задеплоенного frontend на Render
BACKEND_URL=         # URL backend на Render (для webhook)
JWT_SECRET=          # секрет для подписи JWT токенов
PORT=3000
NODE_ENV=development # development | production
```

Файл: `app/frontend/.env`
```env
VITE_API_URL=        # URL backend API
```

---

## 4. Модели базы данных

### User
```js
{
  telegramId:  Number,    // уникальный ID, индексирован
  username:    String,    // @username в Telegram
  firstName:   String,    // имя пользователя
  language:    String,    // 'ru' | 'uz' — выбирается при /start
  familyId:    ObjectId,  // ref: 'Family', null если нет семьи
  createdAt:   Date       // дата регистрации
}
```

### Family
```js
{
  code:      String,    // 6 символов A-Z0-9, уникальный, индексирован
  ownerId:   Number,    // telegramId создателя семьи
  members:   [Number],  // массив telegramId всех участников
  name:      String,    // название семьи (опционально)
  createdAt: Date
}
```

### Transaction
```js
{
  userId:      Number,    // telegramId автора транзакции
  familyId:    ObjectId,  // ref: 'Family', null если нет семьи
  type:        String,    // 'expense' | 'income' | 'transfer'
  amount:      Number,    // положительное число, в сумах
  category:    String,    // из списка категорий ниже
  description: String,    // исходный текст от пользователя
  date:        Date,      // дата транзакции
  createdAt:   Date       // дата создания записи
}
// Индексы: { familyId, date: -1 }, { userId, date: -1 }
```

---

## 5. Категории

### Расходы (expense)

| Категория     | Ключевые слова RU                              | Ключевые слова UZ              |
|---------------|------------------------------------------------|--------------------------------|
| еда           | еда, обед, ужин, завтрак, кафе, ресторан, продукты, базар | ovqat, tushlik, kafe, bozor |
| транспорт     | такси, автобус, метро, бензин, uber, yandex    | taksi, avtobus, benzin         |
| развлечения   | кино, игры, netflix, spotify, кинотеатр        | kino, o'yin                    |
| здоровье      | аптека, врач, больница, лекарства, клиника     | dorixona, shifokor, klinika    |
| одежда        | одежда, обувь, магазин, шопинг                 | kiyim, poyabzal, magazin       |
| коммунальные  | свет, газ, вода, интернет, аренда, телефон     | gaz, suv, internet, ijara      |
| образование   | курсы, школа, книги, учёба, университет        | kurs, maktab, kitob            |
| финансы       | инвестиция, акции, крипто, биржа               | investitsiya, aksiya           |
| другое        | всё остальное                                  | boshqa                         |

### Доходы (income)

| Категория   | Ключевые слова RU                  | Ключевые слова UZ        |
|-------------|------------------------------------|--------------------------|
| зарплата    | зарплата, оклад, salary, получил   | maosh, oylik             |
| фриланс     | фриланс, freelance, заказ, проект  | frilansi, loyiha         |
| инвестиции  | дивиденды, прибыль, доход с акций  | dividendlar, foyda       |
| подарок     | подарок, gift                      | sovg'a                   |
| другое      | всё остальное                      | boshqa                   |

---

## 6. Логика Telegram-бота

### /start — первый запуск

```
1. Проверить: пользователь уже зарегистрирован?
   - Да → показать главное меню на его языке
   - Нет → показать выбор языка

2. Выбор языка (inline keyboard):
   [🇷🇺 Русский]  [🇺🇿 O'zbek tili]

3. После выбора:
   - Создать User в БД с выбранным языком
   - Отправить приветственное сообщение (из locales)
   - Показать кнопку Mini App + reply keyboard меню
```

**Приветственное сообщение (RU):**
```
Отлично! Личный финансовый режим активирован 🎉

Я — ваш персональный финансовый помощник. Вот что я умею:

📝 Записывать расходы и доходы из текстовых сообщений
📊 Строить отчёты и аналитику
👨‍👩‍👧 Вести семейный бюджет
📱 Открывать удобное приложение

Просто напишите мне о расходе:
Такси 15 000
```

### Reply Keyboard (главное меню)
```
[📊 Отчёт]        [👨‍👩‍👧 Семья]
[⚙️ Настройки]   [📱 Открыть приложение]
```

### /create — создать семью
```
1. Сгенерировать код: nanoid(6), только A-Z0-9
2. Создать Family: { code, ownerId, members: [userId] }
3. Обновить User.familyId
4. Ответить:
   "👨‍👩‍👧 Семья создана!
   Ваш код: XK92PL
   Поделитесь им с членами семьи командой /join XK92PL"
```

### /join КОД — вступить в семью
```
1. Извлечь код из сообщения (case-insensitive)
2. Найти Family по коду
3. Если не найдена → "❌ Семья с таким кодом не найдена"
4. Если пользователь уже в этой семье → сообщить об этом
5. Добавить userId в family.members
6. Обновить User.familyId
7. Ответить: "✅ Вы вступили в семью!"
```

### Текстовое сообщение → транзакция

**Алгоритм парсера (`src/utils/parser.js`):**

```
Входная строка: "такси 15 000"

Шаг 1: Нормализация числа
  "15 000" → 15000
  "15,000" → 15000
  "15.000" → 15000

Шаг 2: Определить тип
  Строка начинается с "+" → income
  Строка содержит "перевод" | "transfer" | "o'tkazma" → transfer
  Иначе → expense

Шаг 3: Извлечь сумму
  Первое число в строке

Шаг 4: Получить описание
  Строка без числа, очищенная от пробелов

Шаг 5: Определить категорию
  Перебрать categoryMap, найти совпадение по ключевым словам
  Если не найдено → "другое"

Шаг 6: Вернуть объект или null
  { type, amount, category, description }
  null — если число не найдено (не транзакция, игнорировать)
```

**Примеры:**
```
"такси 15000"       → { type: 'expense',  amount: 15000,   category: 'транспорт' }
"кафе 45 000"       → { type: 'expense',  amount: 45000,   category: 'еда'       }
"+зарплата 2000000" → { type: 'income',   amount: 2000000, category: 'зарплата'  }
"перевод 100000"    → { type: 'transfer', amount: 100000,  category: 'другое'    }
"инвестиция 500000" → { type: 'expense',  amount: 500000,  category: 'финансы'   }
"привет как дела"   → null (игнорировать)
```

**Ответ бота после записи:**
```
✅ Расход записан

🚗 Транспорт
💰 15 000 сум
📅 16.04.2026 21:30

[❌ Удалить]
```

### /report — отчёт за месяц
```
📊 Отчёт за апрель 2026

💸 Расходы: 450 000 сум
  🚗 Транспорт:    120 000
  🍔 Еда:          180 000
  🎮 Развлечения:  150 000

💰 Доходы: 2 000 000 сум
  💼 Зарплата: 2 000 000

📈 Баланс: +1 550 000 сум

👨‍👩‍👧 Семейные расходы: 890 000 сум
```

---

## 7. REST API

Base URL: `/api`
Защищённые роуты: `Authorization: Bearer <jwt_token>`

| Метод  | Путь                      | Описание                        | Защита |
|--------|---------------------------|---------------------------------|--------|
| POST   | /api/auth                 | Аутентификация через initData   | Нет    |
| GET    | /api/transactions         | Список транзакций с фильтрами   | JWT    |
| POST   | /api/transactions         | Создать транзакцию              | JWT    |
| DELETE | /api/transactions/:id     | Удалить транзакцию              | JWT    |
| GET    | /api/analytics            | Аналитика за период             | JWT    |
| GET    | /api/family               | Информация о семье              | JWT    |
| POST   | /api/family/create        | Создать семью                   | JWT    |
| POST   | /api/family/join          | Вступить в семью { code }       | JWT    |
| GET    | /api/user/profile         | Профиль + статистика            | JWT    |
| PATCH  | /api/user/profile         | Обновить язык / имя             | JWT    |

### Query params для GET /api/transactions
```
?type=expense|income|transfer
?month=4&year=2026
?search=текст
?limit=20&page=1
```

### Response GET /api/analytics
```js
{
  total: Number,
  byCategory: [{ category, amount, percent }],
  byDay:      [{ date, amount }],
  byMember:   [{ userId, firstName, amount }]
}
```

---

## 8. Mini App — экраны и компоненты

### Экран 1: Главная
- Карточка периода (Сегодня / Неделя / Месяц)
- Переключатель Расходы | Доходы
- Крупная сумма за период (красная/зелёная)
- 3 кнопки действий: 🔴 РАСХОД / 🟢 ДОХОД / 👥 ПЕРЕВОД
- Последние 5 транзакций (TransactionCard)

### Экран 2: Транзакции
- Карточки итогов: РАСХОДЫ | ДОХОДЫ
- Поиск + фильтры: ВСЕ / ТРАНЗАКЦИИ / ДОХОДЫ / ПЕРЕВОДЫ
- Список всех транзакций
- Модальное окно добавления (открывается с кнопок Главной)

### Экран 3: Аналитика
- Навигация по месяцам ← АПРЕЛЬ, 2026 →
- Переключатель Расходы | Доходы
- Календарь месяца (дни с транзакциями подсвечены)
- Bar chart динамики по пользователям семьи

### Экран 4: Профиль
- Аватар (первая буква имени) + имя
- Метрики: Транзакций / Дней
- Меню: Настройки / Поддержка / Оценить / Отзыв

### Нижняя навигация (всегда видна)
```
🏠 ГЛАВНАЯ  |  💳 ТРАНЗАКЦИЯ  |  📊 АНАЛИТИКА  |  👤 ПРОФИЛЬ
```
Активная вкладка: белый. Остальные: полупрозрачный белый.

---

## 9. Локализация

### `src/locales/ru.js`
```js
module.exports = {
  chooseLanguage: 'Выберите язык / Tilni tanlang:',
  btnRussian: '🇷🇺 Русский',
  btnUzbek: '🇺🇿 O\'zbek tili',
  welcome: 'Отлично! Личный финансовый режим активирован 🎉\n\nПросто напишите о расходе:\nТакси 15 000',
  menuReport: '📊 Отчёт',
  menuFamily: '👨‍👩‍👧 Семья',
  menuSettings: '⚙️ Настройки',
  menuApp: '📱 Открыть приложение',
  expenseSaved: (amount, cat) => `✅ Расход записан\n\n💰 ${amount} сум\n📂 ${cat}`,
  incomeSaved:  (amount, cat) => `✅ Доход записан\n\n💰 ${amount} сум\n📂 ${cat}`,
  transferSaved:(amount)      => `✅ Перевод записан\n\n💰 ${amount} сум`,
  familyCreated:(code)        => `👨‍👩‍👧 Семья создана!\n\nВаш код: *${code}*`,
  familyJoined: '✅ Вы вступили в семью!',
  familyNotFound: '❌ Семья с таким кодом не найдена.',
  errorGeneral: '❌ Произошла ошибка. Попробуйте снова.',
};
```

### `src/locales/uz.js`
```js
module.exports = {
  chooseLanguage: 'Tilni tanlang / Выберите язык:',
  btnRussian: '🇷🇺 Русский',
  btnUzbek: '🇺🇿 O\'zbek tili',
  welcome: 'Ajoyib! Shaxsiy moliyaviy rejim faollashtirildi 🎉\n\nShunchaki xarajat haqida yozing:\nTaksi 15 000',
  menuReport: '📊 Hisobot',
  menuFamily: '👨‍👩‍👧 Oila',
  menuSettings: '⚙️ Sozlamalar',
  menuApp: '📱 Ilovani ochish',
  expenseSaved: (amount, cat) => `✅ Xarajat saqlandi\n\n💰 ${amount} so'm\n📂 ${cat}`,
  incomeSaved:  (amount, cat) => `✅ Daromad saqlandi\n\n💰 ${amount} so'm\n📂 ${cat}`,
  transferSaved:(amount)      => `✅ O'tkazma saqlandi\n\n💰 ${amount} so'm`,
  familyCreated:(code)        => `👨‍👩‍👧 Oila yaratildi!\n\nSizning kodingiz: *${code}*`,
  familyJoined: '✅ Siz oilaga qo\'shildingiz!',
  familyNotFound: '❌ Bunday kodli oila topilmadi.',
  errorGeneral: '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
};
```

---

## 10. Важные детали реализации

### Валидация Telegram initData
```js
const crypto = require('crypto');

function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
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
}
```

### Семейная логика в запросах
```js
// Показывать транзакции семьи если есть, иначе только свои
const query = user.familyId
  ? { familyId: user.familyId }
  : { userId: user.telegramId };
```

### Webhook vs Polling
```js
if (process.env.NODE_ENV === 'production') {
  app.use(bot.webhookCallback('/webhook'));
  bot.telegram.setWebhook(`${process.env.BACKEND_URL}/webhook`);
} else {
  bot.launch();
}
```

### Форматирование суммы
```js
const formatAmount = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' сум';
// 1500000 → "1 500 000 сум"
```

### JWT — хранение в Mini App
```js
// НЕ localStorage — использовать React Context
const AuthContext = createContext(null);
// token хранить в useState внутри AuthProvider
```

---

## 11. Деплой на Render.com

### Backend — Web Service
```
Root Directory:  app/backend
Build Command:   npm install
Start Command:   node src/index.js
ENV: BOT_TOKEN, MONGODB_URI, MINI_APP_URL, BACKEND_URL, JWT_SECRET, NODE_ENV=production
```

### Frontend — Static Site
```
Root Directory:   app/frontend
Build Command:    npm install && npm run build
Publish Directory: dist
ENV: VITE_API_URL=https://oilavyfinance-backend.onrender.com
```

---

## 12. Фазы разработки

### Фаза 1 — Telegram бот
- [ ] MongoDB подключение + модели (User, Family, Transaction)
- [ ] /start с выбором языка RU/UZ
- [ ] Парсер текста → транзакция
- [ ] /create и /join
- [ ] /report

### Фаза 2 — REST API
- [ ] POST /api/auth (валидация initData + JWT)
- [ ] JWT middleware
- [ ] CRUD /api/transactions
- [ ] GET /api/analytics
- [ ] /api/family и /api/user/profile

### Фаза 3 — Mini App
- [ ] useTelegram hook + аутентификация
- [ ] AuthContext
- [ ] BottomNav + React Router
- [ ] Экран Главная
- [ ] Экран Транзакции + форма
- [ ] Экран Аналитика
- [ ] Экран Профиль
- [ ] Тема из theme.md

### Фаза 4 — Деплой
- [ ] Backend на Render
- [ ] Frontend на Render
- [ ] Webhook настройка
- [ ] Mini App регистрация в @BotFather