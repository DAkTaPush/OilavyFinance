# FRONTEND.md — OilavyFinance Mini App

## Стек
- React 18 + Vite
- React Router v6
- Axios
- @twa-dev/sdk (типы для Telegram WebApp)
- CSS Variables (без UI библиотек — чистый CSS)

## Запуск

```bash
cd app/frontend
npm install
npm run dev      # localhost:5173
npm run build    # dist/ для деплоя
```

## Инициализация Telegram WebApp

```js
// src/hooks/useTelegram.js
import { useEffect } from 'react';

export const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    initData: tg?.initData,
  };
};
```

## Структура файлов

```
src/
├── App.jsx                  # роутер + AuthProvider
├── main.jsx                 # точка входа
├── index.css                # CSS переменные + глобальные стили
├── hooks/
│   ├── useTelegram.js       # инициализация WebApp
│   └── useAuth.js           # JWT контекст
├── context/
│   └── AuthContext.jsx      # хранение token + user
├── api/
│   └── axios.js             # axios instance с baseURL и interceptors
├── components/
│   ├── BottomNav.jsx        # нижняя навигация
│   ├── TransactionCard.jsx  # карточка транзакции
│   ├── CategoryIcon.jsx     # цветной квадрат с иконкой
│   ├── AmountDisplay.jsx    # форматированная сумма
│   └── Loader.jsx           # индикатор загрузки
└── pages/
    ├── Home.jsx             # Главная
    ├── Transaction.jsx      # Транзакции
    ├── Analytics.jsx        # Аналитика
    └── Profile.jsx          # Профиль
```

## Axios instance

```js
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Добавлять JWT к каждому запросу
api.interceptors.request.use((config) => {
  const token = /* из AuthContext или state */ null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

## Роутинг (App.jsx)

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/transaction" element={<Transaction />} />
  <Route path="/analytics" element={<Analytics />} />
  <Route path="/profile" element={<Profile />} />
</Routes>
<BottomNav />
```

## Экраны

### Home.jsx — Главная
**Состояние:**
- `activeTab`: 'expense' | 'income'
- `todayStats`: { expenses, incomes, familyTransfers }
- `recentTransactions`: массив последних 5

**Структура:**
```
[Header: 🏠 ГЛАВНАЯ]
[Карточка: СЕГОДНЯ ▾]
  [Переключатель: РАСХОДЫ | ДОХОДЫ]
  [Сумма крупно: -10 000 сум / +30 000 сум]
  [Подпись: Семейные переводы: X сум]
[Секция: Добавить действия]
  [🔴 РАСХОД] [🟢 ДОХОД] [👥 ПЕРЕВОД]
[Секция: Последние расходы/доходы]
  [TransactionCard x5]
```

### Transaction.jsx — Транзакции
**Состояние:**
- `filter`: 'all' | 'expense' | 'income' | 'transfer'
- `search`: строка поиска
- `transactions`: массив

**Структура:**
```
[Header: 💳 ТРАНЗАКЦИЯ]
[Две карточки рядом: РАСХОДЫ -X | ДОХОДЫ +Y]
[Поиск: ПОИСК ТРАНЗАКЦИИ...]
[Фильтры: ВСЕ | ТРАНЗАКЦИИ | ДОХОДЫ | ПЕРЕВОДЫ]
[Список TransactionCard]
[Счётчик: НАЙДЕНО ТРАНЗАКЦИЙ: N]
```

**Модальное окно добавления** (открывается с кнопок на Главной):
```
[Выбор типа: Расход / Доход / Перевод]
[Input: Сумма]
[Select: Категория]
[Input: Описание]
[DatePicker: Дата]
[Кнопка: Сохранить]
```

### Analytics.jsx — Аналитика
**Состояние:**
- `month`, `year`
- `activeTab`: 'expense' | 'income'
- `analyticsData`: { total, byCategory, byDay, byMember }

**Структура:**
```
[Header: 📊 АНАЛИТИКА]
[Период: ← АПРЕЛЬ, 2026 год →]
[Переключатель: РАСХОДЫ | ДОХОДЫ]
[Карточка: Календарь месяца]
  [Сетка дней, дни с транзакциями подсвечены]
[Секция: Динамика расходов по пользователям]
  [Bar chart: по дням или по участникам]
```

### Profile.jsx — Профиль
**Структура:**
```
[Header: 👤 ПРОФИЛЬ]
[Аватар: круг с первой буквой имени]
[Имя: USER_NAME]
[Метрики: [N Транзакций] [N Дней]]
[Меню:]
  [⚙️ НАСТРОЙКИ → имя, e-mail, язык]
  [❓ ПОДДЕРЖКА → контакт разработчика]
  [⭐ ОЦЕНИТЬ БОТА]
  [📝 ОСТАВИТЬ ОТЗЫВ И ОЦЕНКУ]
```

## Компоненты

### BottomNav.jsx
```jsx
const tabs = [
  { path: '/',             icon: '🏠', label: 'ГЛАВНАЯ' },
  { path: '/transaction',  icon: '💳', label: 'ТРАНЗАКЦИЯ' },
  { path: '/analytics',    icon: '📊', label: 'АНАЛИТИКА' },
  { path: '/profile',      icon: '👤', label: 'ПРОФИЛЬ' },
];
// Активная вкладка: белый цвет, остальные: var(--color-text-secondary)
```

### TransactionCard.jsx
```
Props: { type, amount, category, description, date }

Вид:
[цветной квадрат]  [category name]          [±amount сум]
                   [description · дата]
```

Цвет квадрата:
- expense → `var(--color-expense)` (красный)
- income  → `var(--color-income)` (зелёный)
- transfer → `var(--color-transfer)` (жёлтый)

### AmountDisplay.jsx
```jsx
// Форматирует число: 1500000 → "1 500 000 сум"
// type='expense' → красный, type='income' → зелёный
```

## Форматирование чисел

```js
// utils/format.js
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' сум';
};

export const formatDate = (date) => {
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};
```

## Важные детали

1. **Токен** храни в React Context, не в localStorage
2. **tg.expand()** вызывай сразу — Mini App должен быть полноэкранным
3. **tg.BackButton** показывай на вложенных экранах
4. **Загрузка:** показывай `<Loader />` пока идут API запросы
5. **Ошибки:** показывай toast или inline сообщение, не alert()
6. **Пустые состояния:** если транзакций нет — показывай заглушку с текстом