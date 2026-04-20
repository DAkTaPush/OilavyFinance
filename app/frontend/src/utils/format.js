import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

export const formatAmount = (amount) =>
  new Intl.NumberFormat('ru-RU').format(amount ?? 0) + ' сум';

export const formatDate = (date) => dayjs(date).format('DD.MM.YYYY HH:mm');
export const formatDateShort = (date) => dayjs(date).format('DD.MM');

export const formatMonth = (month, year) => {
  const months = [
    'ЯНВАРЬ','ФЕВРАЛЬ','МАРТ','АПРЕЛЬ','МАЙ','ИЮНЬ',
    'ИЮЛЬ','АВГУСТ','СЕНТЯБРЬ','ОКТЯБРЬ','НОЯБРЬ','ДЕКАБРЬ',
  ];
  return `${months[month - 1]}, ${year}`;
};

// ─── Дерево категорий расходов ───────────────────────────────────────────────
export const EXPENSE_TREE = {
  'Кафе и рестораны': {
    emoji: '☕', color: '#FF6B35',
    subs: ['Бар','Кафе','Кофе','Доставка еды','Фастфуд','Кальянная','Ресторан','Стритфуд'],
  },
  'Продукты и быт': {
    emoji: '🛒', color: '#F59E0B',
    subs: ['Продукты','Доставка продуктов','Бытовая химия','Вода'],
  },
  'Транспорт': {
    emoji: '🚗', color: '#4ECDC4',
    subs: ['Такси','Метро','Автобус','Бензин','Газ','Парковка','Штраф','Страховка авто','Ремонт авто'],
  },
  'Жильё и дом': {
    emoji: '🏠', color: '#3B82F6',
    subs: ['Аренда','Ипотека','Коммунальные услуги','Электричество','Газ','Отопление','Вода','Интернет','ТВ','Ремонт','Мебель','Бытовая техника','Товары для дома'],
  },
  'Здоровье': {
    emoji: '💊', color: '#EC4899',
    subs: ['Аптека','Врач','Стоматолог','Спортзал','Анализы','БАДы'],
  },
  'Одежда и уход': {
    emoji: '👕', color: '#8B5CF6',
    subs: ['Одежда','Обувь','Аксессуары','Косметика','Парикмахер','Маникюр'],
  },
  'Развлечения': {
    emoji: '🎮', color: '#A855F7',
    subs: ['Кино','Игры','Путешествия','Авиабилеты','Отель','Подарки','Праздники','Подписки'],
  },
  'Образование': {
    emoji: '📚', color: '#10B981',
    subs: ['Книги','Онлайн-курсы','Репетитор','Школа','Садик'],
  },
  'Дети': {
    emoji: '👶', color: '#F472B6',
    subs: ['Детское питание','Подгузники','Детская одежда','Игрушки','Развлечения'],
  },
  'Животные': {
    emoji: '🐾', color: '#78716C',
    subs: ['Корм','Ветеринар'],
  },
  'Работа и бизнес': {
    emoji: '💼', color: '#0EA5E9',
    subs: ['Реклама','Курсы','Домен','Хостинг','Софт','Подписки','Налоги','Инструменты'],
  },
  'Финансы': {
    emoji: '📈', color: '#8C00FF',
    subs: ['Кредит','Рассрочка','Проценты','Инвестиции','Сбережения','Банковская комиссия','Долг дал','Долг получил','Переводы'],
  },
  'Прочие расходы': {
    emoji: '📦', color: '#6B7280',
    subs: [],
  },
};

// ─── Дерево категорий доходов ─────────────────────────────────────────────────
export const INCOME_TREE = {
  'Зарплата':        { emoji: '💼', color: '#00E676', subs: [] },
  'Прибыль':         { emoji: '📊', color: '#00C853', subs: [] },
  'Бонус/премия':    { emoji: '🏆', color: '#AEEA00', subs: [] },
  'Кэшбэк':          { emoji: '💳', color: '#00BCD4', subs: [] },
  'Подарок':         { emoji: '🎁', color: '#FF3F7F', subs: [] },
  'Выигрыш/находка': { emoji: '🎯', color: '#FFC400', subs: [] },
  'Прочие доходы':   { emoji: '📦', color: '#6B7280', subs: [] },
};

// ─── Переводы ─────────────────────────────────────────────────────────────────
export const TRANSFER_TREE = {
  'Между счетами':  { emoji: '🔄', color: '#FFC400', subs: [] },
  'Семье':          { emoji: '👨‍👩‍👧', color: '#FF9800', subs: [] },
  'Другу/коллеге':  { emoji: '👥', color: '#FF7043', subs: [] },
  'Возврат долга':  { emoji: '🤝', color: '#66BB6A', subs: [] },
  'Долг':           { emoji: '📋', color: '#EF9A9A', subs: [] },
};

// ─── Плоские списки для select ────────────────────────────────────────────────
const treeToFlat = (tree) => {
  const flat = [];
  for (const [parent, { subs }] of Object.entries(tree)) {
    if (subs.length === 0) {
      flat.push(parent);
    } else {
      subs.forEach((sub) => flat.push(`${parent} / ${sub}`));
    }
  }
  return flat;
};

export const CATEGORIES_EXPENSE  = treeToFlat(EXPENSE_TREE);
export const CATEGORIES_INCOME   = treeToFlat(INCOME_TREE);
export const CATEGORIES_TRANSFER = treeToFlat(TRANSFER_TREE);

// ─── Получить emoji + color для любой категории ───────────────────────────────
export const getCategoryInfo = (category = '') => {
  if (!category) return { emoji: '📦', color: '#6B7280' };

  // Пробуем найти точное совпадение среди всех деревьев
  for (const tree of [EXPENSE_TREE, INCOME_TREE, TRANSFER_TREE]) {
    if (tree[category]) return { emoji: tree[category].emoji, color: tree[category].color };
  }

  // Категория вида "Родитель / Подкатегория"
  const parent = category.split(' / ')[0];
  for (const tree of [EXPENSE_TREE, INCOME_TREE, TRANSFER_TREE]) {
    if (tree[parent]) return { emoji: tree[parent].emoji, color: tree[parent].color };
  }

  return { emoji: '📦', color: '#6B7280' };
};
