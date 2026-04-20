# PROJECT_STRUCTURE.md — OilavyFinance

## Полная структура проекта

```
OILAVYFINANCE/
│
├── app/
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.js                  # точка входа: бот + сервер
│   │   │   │
│   │   │   ├── bot/
│   │   │   │   ├── index.js              # Telegraf init, регистрация handlers
│   │   │   │   └── handlers/
│   │   │   │       ├── start.js          # /start → выбор языка → приветствие
│   │   │   │       ├── family.js         # /create, /join КОД
│   │   │   │       ├── message.js        # парсинг текста → транзакция
│   │   │   │       └── report.js         # /report → отчёт за месяц
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── auth.js               # POST /api/auth
│   │   │   │   ├── transactions.js       # GET/POST/DELETE /api/transactions
│   │   │   │   ├── analytics.js          # GET /api/analytics
│   │   │   │   ├── family.js             # GET/POST /api/family
│   │   │   │   └── user.js               # GET/PATCH /api/user/profile
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── User.js
│   │   │   │   ├── Family.js
│   │   │   │   └── Transaction.js
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   └── auth.js               # JWT валидация
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── parser.js             # парсинг текста → { type, amount, category }
│   │   │   │   └── format.js             # форматирование сумм, дат
│   │   │   │
│   │   │   ├── locales/
│   │   │   │   ├── ru.js                 # все тексты на русском
│   │   │   │   └── uz.js                 # все тексты на узбекском
│   │   │   │
│   │   │   └── server.js                 # Express app, CORS, роуты
│   │   │
│   │   ├── .env                          # переменные окружения (не в git!)
│   │   ├── .env.example                  # шаблон переменных
│   │   ├── .gitignore
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx                   # роутер + провайдеры
│       │   ├── main.jsx                  # точка входа React
│       │   ├── index.css                 # CSS переменные + глобальные стили
│       │   │
│       │   ├── hooks/
│       │   │   ├── useTelegram.js        # инициализация WebApp
│       │   │   └── useAuth.js            # аутентификация
│       │   │
│       │   ├── context/
│       │   │   └── AuthContext.jsx       # JWT token + user state
│       │   │
│       │   ├── api/
│       │   │   └── axios.js              # axios instance с interceptors
│       │   │
│       │   ├── utils/
│       │   │   └── format.js             # formatAmount, formatDate
│       │   │
│       │   ├── assets/
│       │   │   └── logo.png              # логотип OilavyFinance
│       │   │
│       │   ├── components/
│       │   │   ├── BottomNav.jsx         # нижняя навигация (4 вкладки)
│       │   │   ├── TransactionCard.jsx   # карточка одной транзакции
│       │   │   ├── CategoryIcon.jsx      # цветной квадрат с emoji категории
│       │   │   ├── AmountDisplay.jsx     # форматированная сумма с цветом
│       │   │   └── Loader.jsx            # спиннер загрузки
│       │   │
│       │   └── pages/
│       │       ├── Home.jsx              # Главная
│       │       ├── Transaction.jsx       # Транзакции + форма добавления
│       │       ├── Analytics.jsx         # Аналитика + календарь + графики
│       │       └── Profile.jsx           # Профиль + настройки
│       │
│       ├── index.html
│       ├── vite.config.js
│       ├── .gitignore
│       └── package.json
│
├── docs/
│   ├── TZ.md                             # полное техническое задание
│   ├── ARCHITECTURE.md                   # архитектура системы
│   ├── BACKEND.md                        # детали backend
│   ├── FRONTEND.md                       # детали frontend
│   ├── PROJECT_STRUCTURE.md              # этот файл
│   ├── Claude.md                         # инструкции для Claude Code
│   ├── theme.md                          # цвета и стили
│   └── done.md                           # лог выполненных задач
│
├── .gitignore                            # корневой gitignore
├── package.json                          # корневой (опционально, для workspaces)
└── README.md                             # описание проекта для GitHub
```

## Что в git, что нет

### Добавить в `.gitignore`:
```
node_modules/
.env
dist/
.DS_Store
```

### Обязательно в git:
```
.env.example      # шаблон без реальных значений
docs/             # вся документация
src/              # весь код
```

## Порядок создания файлов

При первом запуске Claude Code, реализуй в таком порядке:

```
1. app/backend/src/models/          ← сначала схемы данных
2. app/backend/src/locales/         ← тексты
3. app/backend/src/utils/parser.js  ← парсер
4. app/backend/src/bot/             ← handlers бота
5. app/backend/src/api/             ← REST endpoints
6. app/backend/src/server.js        ← Express
7. app/backend/src/index.js         ← точка входа
8. app/frontend/src/context/        ← Auth контекст
9. app/frontend/src/api/            ← axios
10. app/frontend/src/components/    ← компоненты
11. app/frontend/src/pages/         ← страницы
12. app/frontend/src/App.jsx        ← роутер
```