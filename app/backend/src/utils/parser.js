/**
 * Карта категорий с ключевыми словами (RU + UZ)
 */
const CATEGORY_MAP = {
  // Расходы
  еда: ['еда', 'обед', 'ужин', 'завтрак', 'кафе', 'ресторан', 'продукты', 'базар',
        'ovqat', 'tushlik', 'kechki', 'nonushta', 'kafe', 'restoran', 'oziq', 'bozor'],
  транспорт: ['такси', 'автобус', 'метро', 'бензин', 'uber', 'yandex', 'транспорт',
              'taksi', 'avtobus', 'metro', 'benzin', 'transport'],
  развлечения: ['кино', 'игры', 'netflix', 'spotify', 'кинотеатр', 'развлечения', 'театр',
                'kino', "o'yin", 'oyun', 'kinoteatr'],
  здоровье: ['аптека', 'врач', 'больница', 'лекарства', 'клиника', 'здоровье',
             'dorixona', 'shifokor', 'kasalxona', 'dori', 'klinika'],
  одежда: ['одежда', 'обувь', 'магазин', 'шопинг',
           'kiyim', 'poyabzal', 'magazin', 'shopping'],
  коммунальные: ['свет', 'газ', 'вода', 'интернет', 'аренда', 'телефон', 'коммуналка',
                 'gaz', 'suv', 'internet', 'ijara', 'telefon'],
  образование: ['курсы', 'школа', 'книги', 'учёба', 'университет', 'образование',
                'kurs', 'maktab', 'kitob', 'talim', 'universitet'],
  финансы: ['инвестиция', 'акции', 'крипто', 'биржа', 'инвестиции',
            'investitsiya', 'aksiya', 'kripto', 'birja'],

  // Доходы
  зарплата: ['зарплата', 'оклад', 'salary', 'получил', 'получила',
             'maosh', 'oylik', 'ish haqi'],
  фриланс: ['фриланс', 'freelance', 'заказ', 'проект',
            'frilansi', 'loyiha', 'buyurtma'],
  инвестиции: ['дивиденды', 'прибыль', 'доход с акций',
               'dividendlar', 'foyda'],
  подарок: ['подарок', 'gift', "sovg'a", 'sovga', 'hadya'],
};

/**
 * Определяет категорию по тексту описания
 */
const detectCategory = (text) => {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return category;
    }
  }
  return 'другое';
};

/**
 * Парсит текстовое сообщение в объект транзакции
 * @param {string} text
 * @returns {{ type, amount, category, description } | null}
 */
const parseTransaction = (text) => {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();

  // Нормализуем: "15 000" → "15000", "15,000" → "15000", "15.000" → "15000"
  const normalized = trimmed
    .replace(/(\d)\s+(\d)/g, '$1$2')    // убираем пробелы между цифрами
    .replace(/(\d),(\d{3})/g, '$1$2')   // убираем запятые-разделители
    .replace(/(\d)\.(\d{3})/g, '$1$2'); // убираем точки-разделители

  // Извлекаем первое число
  const numMatch = normalized.match(/\d+(?:\.\d+)?/);
  if (!numMatch) return null;

  const amount = parseFloat(numMatch[0]);
  if (!amount || amount <= 0) return null;

  const lowerText = trimmed.toLowerCase();

  // Определяем тип транзакции
  let type = 'expense';
  if (trimmed.startsWith('+')) {
    type = 'income';
  } else if (
    lowerText.includes('перевод') ||
    lowerText.includes('transfer') ||
    lowerText.includes("o'tkazma") ||
    lowerText.includes('otkazma')
  ) {
    type = 'transfer';
  } else {
    // Проверяем ключевые слова доходов
    const incomeKeywords = [
      'зарплата', 'оклад', 'salary', 'получил', 'получила',
      'maosh', 'oylik', 'фриланс', 'freelance', 'заказ', 'проект',
      'дивиденды', 'прибыль', 'подарок', 'gift', "sovg'a",
      'frilansi', 'dividendlar', 'foyda',
    ];
    if (incomeKeywords.some((kw) => lowerText.includes(kw))) {
      type = 'income';
    }
  }

  // Очищаем описание: убираем ведущий "+", число и лишние пробелы
  const description = trimmed
    .replace(/^\+/, '')
    .replace(/\d[\d\s,.]*/g, '')
    .trim();

  const category = detectCategory(trimmed);

  return { type, amount, category, description };
};

module.exports = { parseTransaction, detectCategory, CATEGORY_MAP };
