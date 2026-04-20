# OilavyFinance 💜

**Личный и семейный финансовый помощник в Telegram**

Записывайте расходы и доходы текстом прямо в чате. Следите за финансами семьи через удобное Mini App приложение.

---

## Возможности

- 💬 **Запись текстом** — просто напишите `такси 15000` и бот сам определит сумму и категорию
- 👨‍👩‍👧 **Семейный режим** — создайте семью и следите за общим бюджетом
- 📊 **Аналитика** — отчёты по категориям, динамика по дням, статистика по участникам
- 📱 **Mini App** — полноценное приложение прямо в Telegram
- 🌐 **Два языка** — русский и узбекский
- 💳 **3 типа операций** — расходы, доходы, переводы

---

## Скриншоты

| Главная | Транзакции | Аналитика | Профиль |
|---------|------------|-----------|---------|
| ![home] | ![trans]   | ![anal]   | ![prof] |

---

## Стек технологий

**Backend**
- Node.js + [Telegraf](https://telegraf.js.org/) v4
- Express.js
- MongoDB + Mongoose
- JWT аутентификация

**Frontend**
- React + Vite
- Telegram Mini App SDK
- CSS Variables (тёмная фиолетовая тема)

**Деплой**
- [Render.com](https://render.com)
- [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## Быстрый старт

### Требования
- Node.js 20+
- MongoDB Atlas аккаунт
- Telegram Bot Token от [@BotFather](https://t.me/BotFather)

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/OilavyFinance.git
cd OilavyFinance

# Backend
cd app/backend
npm install
cp .env.example .env
# Заполнить .env своими значениями

# Frontend
cd ../frontend
npm install
```

### Переменные окружения

Создайте `app/backend/.env`:

```env
BOT_TOKEN=ваш_токен_от_botfather
MONGODB_URI=mongodb+srv://...
MINI_APP_URL=https://ваш-frontend.onrender.com
JWT_SECRET=придумайте_секрет
PORT=3000
NODE_ENV=development
```

### Запуск (разработка)

```bash
# Backend (в одном терминале)
cd app/backend
npm run dev

# Frontend (в другом терминале)
cd app/frontend
npm run dev
```

---

## Использование бота

### Команды

| Команда | Описание |
|---------|----------|
| `/start` | Запуск бота, выбор языка |
| `/create` | Создать семью, получить код |
| `/join КОД` | Вступить в семью по коду |
| `/report` | Отчёт за текущий месяц |

### Запись транзакций

Просто напишите сообщение:

```
такси 15 000          → расход, категория "транспорт"
кафе 45000            → расход, категория "еда"
+зарплата 2000000     → доход, категория "зарплата"
перевод 100000        → перевод
инвестиция 500000     → расход, категория "финансы"
```

---

## Деплой на Render.com

### Backend (Web Service)
- **Root Directory:** `app/backend`
- **Build Command:** `npm install`
- **Start Command:** `node src/index.js`
- Добавить все переменные из `.env.example`

### Frontend (Static Site)
- **Root Directory:** `app/frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- Добавить: `VITE_API_URL=https://ваш-backend.onrender.com`

---

## Структура проекта

```
OILAVYFINANCE/
├── app/
│   ├── backend/      # Node.js бот + Express API
│   └── frontend/     # React Mini App
├── docs/             # техническая документация
└── README.md
```

Подробная документация в папке [`docs/`](./docs/).

---

## Лицензия

MIT © OilavyFinance 2026