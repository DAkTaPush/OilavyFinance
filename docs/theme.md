# theme.md — OilavyFinance Design System

## Цветовая палитра

| Название         | HEX       | Использование                              |
|------------------|-----------|--------------------------------------------|
| Primary Dark     | `#450693` | Фон приложения, тёмные поверхности         |
| Primary          | `#8C00FF` | Основной фиолетовый, кнопки, акценты       |
| Pink Accent      | `#FF3F7F` | Акцент, уведомления, важные элементы       |
| Yellow Accent    | `#FFC400` | Переводы, предупреждения, highlights       |
| White            | `#FFFFFF` | Текст, иконки, активные элементы           |

## CSS переменные (index.css)

```css
:root {
  /* Основные цвета */
  --color-bg:              #450693;   /* фон всего приложения */
  --color-primary:         #8C00FF;   /* основной фиолетовый */
  --color-primary-dark:    #450693;   /* тёмный фиолетовый */
  --color-primary-light:   #A040FF;   /* светлее для hover */
  --color-accent-pink:     #FF3F7F;   /* розовый акцент */
  --color-accent-yellow:   #FFC400;   /* жёлтый акцент */

  /* Поверхности (карточки, панели) */
  --color-surface:         rgba(140, 0, 255, 0.2);   /* карточки */
  --color-surface-dark:    rgba(69, 6, 147, 0.8);    /* тёмные панели */
  --color-border:          rgba(140, 0, 255, 0.35);  /* обводки */

  /* Текст */
  --color-text:            #FFFFFF;              /* основной */
  --color-text-secondary:  rgba(255,255,255,0.6); /* вторичный */
  --color-text-muted:      rgba(255,255,255,0.35);/* приглушённый */

  /* Транзакции */
  --color-expense:         #FF3F7F;   /* расход — розово-красный */
  --color-income:          #00E676;   /* доход — зелёный */
  --color-transfer:        #FFC400;   /* перевод — жёлтый */

  /* Скруглення */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  /* Отступы */
  --spacing-xs:  4px;
  --spacing-sm:  8px;
  --spacing-md:  16px;
  --spacing-lg:  24px;
  --spacing-xl:  32px;
}
```

## Глобальные стили (index.css продолжение)

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  min-height: 100vh;
  overflow-x: hidden;
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 70px; /* место для BottomNav */
}
```

## Компоненты UI

### Кнопки

```css
/* Основная кнопка */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

/* Круглая кнопка действия (Расход/Доход/Перевод) */
.btn-action {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  gap: 4px;
}

.btn-action.expense  { background: var(--color-expense); }
.btn-action.income   { background: var(--color-income); color: #000; }
.btn-action.transfer { background: var(--color-primary); }
```

### Карточки

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  backdrop-filter: blur(10px);
}
```

### Переключатель (вкладки)

```css
.tab-switcher {
  display: flex;
  background: var(--color-surface-dark);
  border-radius: var(--radius-md);
  padding: 3px;
}

.tab-switcher .tab {
  flex: 1;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-switcher .tab.active {
  background: var(--color-primary);
  color: var(--color-text);
}
```

### BottomNav

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: var(--color-surface-dark);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  z-index: 100;
}

.bottom-nav .nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.bottom-nav .nav-item.active {
  color: var(--color-text);
}
```

### Header страницы

```css
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--spacing-md);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
}
```

### TransactionCard

```css
.transaction-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.transaction-card .category-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.transaction-card .info {
  flex: 1;
}

.transaction-card .category-name {
  font-weight: 600;
  font-size: 14px;
}

.transaction-card .meta {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.transaction-card .amount {
  font-weight: 700;
  font-size: 14px;
}

.amount.expense  { color: var(--color-expense); }
.amount.income   { color: var(--color-income); }
.amount.transfer { color: var(--color-transfer); }
```

## Иконки категорий

```js
// utils/categories.js
export const CATEGORY_ICONS = {
  // Расходы
  еда:          { emoji: '🍔', color: '#FF6B35' },
  транспорт:    { emoji: '🚗', color: '#4ECDC4' },
  развлечения:  { emoji: '🎮', color: '#A855F7' },
  здоровье:     { emoji: '💊', color: '#EC4899' },
  одежда:       { emoji: '👕', color: '#3B82F6' },
  коммунальные: { emoji: '🏠', color: '#F59E0B' },
  образование:  { emoji: '📚', color: '#10B981' },
  финансы:      { emoji: '📈', color: '#8C00FF' },
  другое:       { emoji: '📦', color: '#6B7280' },
  // Доходы
  зарплата:     { emoji: '💼', color: '#00E676' },
  фриланс:      { emoji: '💻', color: '#00BCD4' },
  инвестиции:   { emoji: '📊', color: '#FFC400' },
  подарок:      { emoji: '🎁', color: '#FF3F7F' },
};
```

## Типография

```css
/* Заголовки страниц */
h1 { font-size: 18px; font-weight: 700; letter-spacing: 1px; }

/* Суммы крупно */
.amount-large { font-size: 28px; font-weight: 700; }

/* Основной текст */
body { font-size: 14px; font-weight: 400; }

/* Мелкий текст (дата, подписи) */
.text-sm { font-size: 11px; }
```

## Анимации

```css
/* Плавные переходы */
* { transition: background-color 0.2s, color 0.2s, opacity 0.2s; }

/* Нажатие кнопок */
button:active { opacity: 0.8; transform: scale(0.97); }
```