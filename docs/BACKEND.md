# BACKEND.md — OilavyFinance

## Стек
- Node.js 20+
- Telegraf v4 (Telegram Bot)
- Express.js (REST API)
- Mongoose (MongoDB ODM)
- dayjs (даты)
- nanoid (генерация кодов семьи)
- jsonwebtoken (JWT)
- dotenv

## Точка входа: `src/index.js`

```js
// Запускает и бота и Express сервер одновременно
// В production: webhook
// В development: polling
```

## Переменные окружения

| Переменная     | Описание                              |
|----------------|---------------------------------------|
| BOT_TOKEN      | Токен от @BotFather                   |
| MONGODB_URI    | MongoDB Atlas connection string       |
| MINI_APP_URL   | URL задеплоенного frontend            |
| JWT_SECRET     | Секрет для подписи JWT токенов        |
| PORT           | Порт Express (default: 3000)          |
| NODE_ENV       | development / production              |

## Модели данных

### User
```js
{
  telegramId: Number,      // уникальный, индексирован
  username: String,
  firstName: String,
  language: String,        // 'ru' | 'uz'
  familyId: ObjectId,      // ref: 'Family', может быть null
  createdAt: Date
}
```

### Family
```js
{
  code: String,            // 6 символов, уникальный, индексирован
  ownerId: Number,         // telegramId создателя
  members: [Number],       // массив telegramId
  name: String,
  createdAt: Date
}
```

### Transaction
```js
{
  userId: Number,          // telegramId автора
  familyId: ObjectId,      // ref: 'Family'
  type: String,            // 'expense' | 'income' | 'transfer'
  amount: Number,          // всегда положительное число
  category: String,
  description: String,
  date: Date,
  createdAt: Date
}
// Индексы: { familyId, date }, { userId, date }
```

## Команды бота

### /start
```
1. Отправить сообщение с выбором языка (inline keyboard)
   - 🇷🇺 Русский
   - 🇺🇿 O'zbek tili
2. По нажатию: сохранить язык, показать приветствие
3. Показать главное меню + кнопку Mini App
```

### /create
```
1. Сгенерировать уникальный код (nanoid 6 символов, A-Z0-9)
2. Создать Family документ
3. Присвоить пользователю familyId
4. Ответить с кодом семьи
```

### /join [КОД]
```
1. Найти Family по коду (case-insensitive)
2. Если не найдена → ошибка
3. Добавить userId в members
4. Обновить User.familyId
5. Ответить об успехе
```

### Текстовое сообщение → транзакция
```
Парсер (src/utils/parser.js):

1. Нормализовать: убрать пробелы/запятые в числах
   "45 000" → 45000
   "45,000" → 45000

2. Определить тип:
   Начинается с "+" или содержит слова дохода → income
   Содержит "перевод/transfer/o'tkazma" → transfer
   Иначе → expense

3. Извлечь сумму: первое число в строке

4. Определить категорию по ключевым словам

5. Сохранить Transaction

6. Ответить подтверждением
```

### /report
```
Агрегация MongoDB за текущий месяц:
- Сумма расходов по категориям
- Сумма доходов
- Итоговый баланс
- Семейные расходы (если есть familyId)
```

## REST API эндпоинты

### Публичные
```
POST /api/auth          Аутентификация через Telegram initData
```

### Защищённые (требуют JWT)
```
GET    /api/transactions          Список транзакций
POST   /api/transactions          Создать транзакцию
DELETE /api/transactions/:id      Удалить транзакцию

GET    /api/analytics             Аналитика за период

GET    /api/family                Информация о семье
POST   /api/family/create         Создать семью
POST   /api/family/join           Вступить в семью { code }

GET    /api/user/profile          Профиль пользователя
PATCH  /api/user/profile          Обновить профиль
```

## Категории

### Расходы
| Ключ          | Ключевые слова (RU)                        | Ключевые слова (UZ)           |
|---------------|--------------------------------------------|-------------------------------|
| еда           | еда, обед, ужин, кафе, ресторан, продукты  | ovqat, tushlik, kafe          |
| транспорт     | такси, автобус, метро, бензин, uber        | taksi, avtobus, benzin        |
| развлечения   | кино, игры, netflix, spotify               | kino, o'yin                   |
| здоровье      | аптека, врач, больница, лекарства          | dorixona, shifokor            |
| одежда        | одежда, обувь, магазин                     | kiyim, poyabzal               |
| коммунальные  | свет, газ, вода, интернет, аренда          | gaz, suv, internet, ijara     |
| образование   | курсы, школа, книги, учёба                 | kurs, maktab, kitob           |
| финансы       | инвестиция, акции, крипто                  | investitsiya, aksiya          |
| другое        | (всё остальное)                            | (boshqa)                      |

### Доходы
| Ключ      | Ключевые слова              |
|-----------|-----------------------------|
| зарплата  | зарплата, оклад, salary     |
| фриланс   | фриланс, freelance, заказ   |
| инвестиции| дивиденды, прибыль          |
| подарок   | подарок, gift               |
| другое    | (всё остальное)             |

## Локализация

Файлы: `src/locales/ru.js` и `src/locales/uz.js`

Использование:
```js
const t = require(`../locales/${user.language}`);
bot.reply(t.welcome);
bot.reply(t.expenseSaved(15000, 'транспорт'));
```

## Webhook vs Polling

```js
if (process.env.NODE_ENV === 'production') {
  // Webhook — для Render.com
  app.use(bot.webhookCallback('/webhook'));
  bot.telegram.setWebhook(`${process.env.BACKEND_URL}/webhook`);
} else {
  // Polling — для локальной разработки
  bot.launch();
}
```