const dayjs = require('dayjs');
require('dayjs/locale/ru');

dayjs.locale('ru');

/**
 * Форматирует сумму: 1500000 → "1 500 000"
 */
const formatAmount = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount);
};

/**
 * Форматирует дату: "16.04.2026 21:30"
 */
const formatDate = (date) => {
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};

/**
 * Возвращает название месяца на русском
 */
const getMonthName = (month, year) => {
  const months = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
  ];
  return months[month - 1] || String(month);
};

/**
 * Иконки категорий для бота
 */
const CATEGORY_EMOJI = {
  еда: '🍔',
  транспорт: '🚗',
  развлечения: '🎮',
  здоровье: '💊',
  одежда: '👕',
  коммунальные: '🏠',
  образование: '📚',
  финансы: '📈',
  зарплата: '💼',
  фриланс: '💻',
  инвестиции: '📊',
  подарок: '🎁',
  другое: '📦',
};

const getCategoryEmoji = (category) => CATEGORY_EMOJI[category] || '📦';

module.exports = { formatAmount, formatDate, getMonthName, getCategoryEmoji };
