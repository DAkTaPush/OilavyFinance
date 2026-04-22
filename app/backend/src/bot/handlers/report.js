const dayjs = require('dayjs');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { formatAmount, getMonthName, getCategoryEmoji } = require('../../utils/format');

/**
 * /report — расширенный отчёт за текущий месяц
 * Включает: топ-5 категорий, сравнение с прошлым месяцем, кто сколько потратил (семья)
 */
const reportHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });
    if (!user) return ctx.reply('Сначала введите /start для регистрации.');

    const t = require(`../../locales/${user.language}`);
    const now = dayjs();

    // Текущий и прошлый месяц
    const startCur  = now.startOf('month').toDate();
    const endCur    = now.endOf('month').toDate();
    const startPrev = now.subtract(1, 'month').startOf('month').toDate();
    const endPrev   = now.subtract(1, 'month').endOf('month').toDate();

    const [txCur, txPrev] = await Promise.all([
      Transaction.find({ userId: telegramId, date: { $gte: startCur,  $lte: endCur  } }).lean(),
      Transaction.find({ userId: telegramId, date: { $gte: startPrev, $lte: endPrev } }).lean(),
    ]);

    if (!txCur.length) return ctx.reply(t.reportEmpty);

    const expenses = txCur.filter(tx => tx.type === 'expense');
    const incomes  = txCur.filter(tx => tx.type === 'income');
    const totalExp = expenses.reduce((s, tx) => s + tx.amount, 0);
    const totalInc = incomes.reduce((s,  tx) => s + tx.amount, 0);
    const balance  = totalInc - totalExp;

    // Прошлый месяц для сравнения
    const prevExp = txPrev.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);

    // Топ-5 категорий расходов
    const byCategory = {};
    for (const tx of expenses) {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
    }
    const top5 = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const monthName = getMonthName(now.month() + 1, now.year());
    let report = `${t.reportHeader(monthName, now.year())}\n\n`;

    // Расходы
    if (totalExp > 0) {
      report += `💸 *${user.language === 'uz' ? 'Xarajatlar' : 'Расходы'}:* ${formatAmount(totalExp)} сум\n\n`;

      // Топ-5 категорий
      report += `🏆 *${user.language === 'uz' ? 'Top-5 kategoriya' : 'Топ-5 категорий'}:*\n`;
      top5.forEach(([cat, amt], i) => {
        const emoji = getCategoryEmoji(cat);
        const pct = Math.round((amt / totalExp) * 100);
        report += `  ${i + 1}. ${emoji} ${cat}: ${formatAmount(amt)} (${pct}%)\n`;
      });
      report += '\n';
    }

    // Доходы
    if (totalInc > 0) {
      const incByCategory = {};
      for (const tx of incomes) {
        incByCategory[tx.category] = (incByCategory[tx.category] || 0) + tx.amount;
      }
      report += `💰 *${user.language === 'uz' ? 'Daromadlar' : 'Доходы'}:* ${formatAmount(totalInc)} сум\n`;
      for (const [cat, amt] of Object.entries(incByCategory)) {
        report += `  ${getCategoryEmoji(cat)} ${cat}: ${formatAmount(amt)}\n`;
      }
      report += '\n';
    }

    // Баланс
    report += `📊 *${user.language === 'uz' ? 'Balans' : 'Баланс'}:* ${balance >= 0 ? '+' : ''}${formatAmount(balance)} сум\n`;

    // Сравнение с прошлым месяцем
    if (prevExp > 0 && totalExp > 0) {
      const diff = totalExp - prevExp;
      const pct  = Math.abs(Math.round((diff / prevExp) * 100));
      const sign = diff > 0 ? '📈 +' : '📉 -';
      const prevMonth = getMonthName(now.subtract(1, 'month').month() + 1, now.year());
      report += `\n${sign}${pct}% ${user.language === 'uz'
        ? `o'tgan oyga nisbatan (${prevMonth}: ${formatAmount(prevExp)} сум)`
        : `по сравнению с ${prevMonth} (${formatAmount(prevExp)} сум)`}\n`;
    }

    // Кто сколько потратил (семья)
    if (user.familyId) {
      const familyTx = await Transaction.find({
        familyId: user.familyId,
        type: 'expense',
        date: { $gte: startCur, $lte: endCur },
      }).lean();

      if (familyTx.length) {
        const byMember = {};
        for (const tx of familyTx) {
          byMember[tx.userId] = (byMember[tx.userId] || 0) + tx.amount;
        }
        const memberIds = Object.keys(byMember).map(Number);
        const members   = await User.find({ telegramId: { $in: memberIds } }).lean();
        const nameMap   = {};
        for (const m of members) nameMap[m.telegramId] = m.fullName || m.firstName || `#${m.telegramId}`;

        report += `\n👨‍👩‍👧 *${user.language === 'uz' ? 'Oila xarajatlari' : 'Расходы семьи'}:*\n`;
        for (const [uid, amt] of Object.entries(byMember).sort((a,b) => b[1]-a[1])) {
          report += `  👤 ${nameMap[uid] || uid}: ${formatAmount(amt)} сум\n`;
        }
      }
    }

    console.log('[BOT] report generated for user:', telegramId);
    await ctx.reply(report, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[REPORT HANDLER]', err);
    await ctx.reply('❌ Произошла ошибка. Попробуйте снова.');
  }
};

module.exports = { reportHandler };
