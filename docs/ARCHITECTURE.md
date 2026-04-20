# ARCHITECTURE.md — OilavyFinance

## Общая архитектура

```
┌─────────────────────────────────────────────────────┐
│                   TELEGRAM                          │
│                                                     │
│   Пользователь → Telegram Bot (@OilavyFinanceBot)   │
│                       ↓                             │
│              Mini App (WebApp кнопка)               │
└─────────────────────────────────────────────────────┘
           ↓                        ↓
    [Telegraf Bot]           [React Mini App]
    Node.js + Express        Vite + React
    Render.com               Render.com (static)
           ↓                        ↓
    [REST API /api/*] ←────────────┘
           ↓
    [MongoDB Atlas]
```

## Два режима работы

### 1. Текстовый бот
Пользователь пишет команды и сообщения прямо в Telegram чате.
Бот отвечает текстом и inline-кнопками.

### 2. Mini App
Пользователь открывает веб-приложение через кнопку в боте.
Полноценный UI с 4 вкладками, графиками, формами.

## Поток аутентификации

```
Mini App запускается
       ↓
window.Telegram.WebApp.initData (строка от Telegram)
       ↓
POST /api/auth { initData }
       ↓
Backend валидирует подпись (HMAC-SHA256)
       ↓
Возвращает JWT токен
       ↓
Все дальнейшие запросы: Authorization: Bearer <token>
```

## Семейный режим

```
Пользователь А создаёт семью → получает код "XK92PL"
Пользователь Б пишет /join XK92PL → вступает в семью

Транзакции:
- Без семьи → видны только своему владельцу
- С семьёй  → видны всем членам семьи
```

## Деплой на Render.com

```
Backend  → Web Service  → auto-deploy из /app/backend
Frontend → Static Site  → auto-deploy из /app/frontend/dist
MongoDB  → MongoDB Atlas (отдельно)
```

Webhook URL для Telegram:
`https://<backend-render-url>/webhook`