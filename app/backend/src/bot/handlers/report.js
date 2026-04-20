const dayjs = require('dayjs');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { formatAmount, getMonthName, getCategoryEmoji } = require('../../utils/format');

/**
 * /report — текстовый отчёт за текущий месяц
 */
const reportHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });

    if (!user) {
      return ctx.reply('Сначала введите /start для регистрации.');
    }

    const t = require(`../../locales/${user.language}`);

    const now = dayjs();
    const startOfMonth = now.startOf('month').toDate();
    const endOfMonth = now.endOf('month').toDate();

    // Запрос транзакций пользователя за месяц
    const personalQuery = {
      userId: telegramId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    };

    const transactions = await Transaction.find(personalQuery).lean();

    if (!transactions.length) {
      return ctx.reply(t.reportEmpty);
    }

    // Подсчёт расходов по категориям
    const expenses = transactions.filter((tx) => tx.type === 'expense');
    const incomes = transactions.filter((tx) => tx.type === 'income');

    const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncomes = incomes.reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalIncomes - totalExpenses;

    // Группируем расходы по категориям
    const byCategory = {};
    for (const tx of expenses) {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
    }

    const monthName = getMonthName(now.month() + 1, now.year());
    let report = `${t.reportHeader(monthName, now.year())}\n\n`;

    if (totalExpenses > 0) {
      report += `${t.reportExpenses(formatAmount(totalExpenses))}\n`;
      for (const [cat, amount] of Object.entries(byCategory)) {
        const emoji = getCategoryEmoji(cat);
        report += `  ${emoji} ${cat}: ${formatAmount(amount)}\n`;
      }
      report += '\n';
    }

    if (totalIncomes > 0) {
      // Группируем доходы по категориям
      const incomeByCategory = {};
      for (const tx of incomes) {
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
      }
      report += `${t.reportIncomes(formatAmount(totalIncomes))}\n`;
      for (const [cat, amount] of Object.entries(incomeByCategory)) {
        const emoji = getCategoryEmoji(cat);
        report += `  ${emoji} ${cat}: ${formatAmount(amount)}\n`;
      }
      report += '\n';
    }

    report += t.reportBalance(balance);

    // Семейные расходы (если пользователь в семье)
    if (user.familyId) {
      const familyExpenses = await Transaction.find({
        familyId: user.familyId,
        type: 'expense',
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }).lean();

      const familyTotal = familyExpenses.reduce((sum, tx) => sum + tx.amount, 0);
      if (familyTotal > 0) {
        report += t.reportFamily(formatAmount(familyTotal));
      }
    }

    console.log('[BOT] report generated for user:', telegramId);
    await ctx.reply(report);
  } catch (err) {
    console.error('[REPORT HANDLER]', err);
    const user = await User.findOne({ telegramId: ctx.from?.id });
    const t = require(`../../locales/${user?.language || 'ru'}`);
    await ctx.reply(t.errorGeneral);
  }
};

module.exports = { reportHandler };
