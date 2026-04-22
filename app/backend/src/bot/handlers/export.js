const XLSX = require('xlsx');
const dayjs = require('dayjs');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { formatAmount, getMonthName } = require('../../utils/format');

/**
 * /export — отправляет Excel-файл с транзакциями за текущий месяц
 */
const exportHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });
    if (!user) return ctx.reply('Сначала введите /start для регистрации.');

    const now       = dayjs();
    const startDate = now.startOf('month').toDate();
    const endDate   = now.endOf('month').toDate();

    const transactions = await Transaction.find({
      userId: telegramId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 }).lean();

    if (!transactions.length) {
      return ctx.reply(user.language === 'uz'
        ? '📭 Bu oy tranzaksiyalar topilmadi.'
        : '📭 В этом месяце транзакций нет.');
    }

    // Заголовки таблицы
    const headers = user.language === 'uz'
      ? ['Sana', 'Tur', 'Kategoriya', 'Tavsif', 'Summa']
      : ['Дата', 'Тип', 'Категория', 'Описание', 'Сумма'];

    const typeLabel = (type) => {
      if (user.language === 'uz') {
        return type === 'expense' ? 'Xarajat' : type === 'income' ? 'Daromad' : 'O\'tkazma';
      }
      return type === 'expense' ? 'Расход' : type === 'income' ? 'Доход' : 'Перевод';
    };

    // Строки данных
    const rows = transactions.map(tx => [
      dayjs(tx.date).format('DD.MM.YYYY HH:mm'),
      typeLabel(tx.type),
      tx.category || '—',
      tx.description || '—',
      tx.type === 'expense' ? -tx.amount : tx.amount,
    ]);

    // Итоги
    const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    rows.push([]);
    rows.push([
      user.language === 'uz' ? 'Jami xarajat' : 'Итого расходы',
      '', '', '', -totalExp,
    ]);
    rows.push([
      user.language === 'uz' ? 'Jami daromad' : 'Итого доходы',
      '', '', '', totalInc,
    ]);
    rows.push([
      user.language === 'uz' ? 'Balans' : 'Баланс',
      '', '', '', totalInc - totalExp,
    ]);

    // Создаём книгу Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Ширина колонок
    ws['!cols'] = [
      { wch: 18 }, { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 15 },
    ];

    const monthName = getMonthName(now.month() + 1, now.year());
    XLSX.utils.book_append_sheet(wb, ws, monthName);

    // Буфер файла
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `OilavyFinance_${now.format('YYYY_MM')}.xlsx`;

    await ctx.replyWithDocument(
      { source: buffer, filename: fileName },
      {
        caption: user.language === 'uz'
          ? `📊 ${monthName} ${now.year()} — ${transactions.length} ta tranzaksiya`
          : `📊 ${monthName} ${now.year()} — ${transactions.length} транзакций`,
      }
    );

    console.log('[BOT] export sent to user:', telegramId);
  } catch (err) {
    console.error('[EXPORT HANDLER]', err);
    await ctx.reply('❌ Произошла ошибка при создании файла.');
  }
};

module.exports = { exportHandler };
