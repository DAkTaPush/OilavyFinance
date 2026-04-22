const cron = require('node-cron');
const dayjs = require('dayjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { formatAmount, getCategoryEmoji } = require('../utils/format');

/**
 * Отправляет еженедельный отчёт одному пользователю
 */
const sendWeeklyReport = async (bot, user) => {
  try {
    const now       = dayjs();
    const startWeek = now.subtract(7, 'day').startOf('day').toDate();
    const endWeek   = now.endOf('day').toDate();

    const transactions = await Transaction.find({
      userId: user.telegramId,
      date: { $gte: startWeek, $lte: endWeek },
    }).lean();

    if (!transactions.length) return; // не беспокоим если нет транзакций

    const expenses = transactions.filter(tx => tx.type === 'expense');
    const incomes  = transactions.filter(tx => tx.type === 'income');
    const totalExp = expenses.reduce((s, tx) => s + tx.amount, 0);
    const totalInc = incomes.reduce((s,  tx) => s + tx.amount, 0);

    // Топ-3 категории расходов за неделю
    const byCategory = {};
    for (const tx of expenses) {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
    }
    const top3 = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const isUz = user.language === 'uz';
    const dateFrom = dayjs(startWeek).format('DD.MM');
    const dateTo   = now.format('DD.MM');

    let msg = isUz
      ? `📅 *Haftalik hisobot* (${dateFrom} — ${dateTo})\n\n`
      : `📅 *Еженедельный отчёт* (${dateFrom} — ${dateTo})\n\n`;

    if (totalExp > 0) {
      msg += `💸 ${isUz ? 'Xarajatlar' : 'Расходы'}: *${formatAmount(totalExp)} сум*\n`;
      for (const [cat, amt] of top3) {
        msg += `  ${getCategoryEmoji(cat)} ${cat}: ${formatAmount(amt)} сум\n`;
      }
      msg += '\n';
    }

    if (totalInc > 0) {
      msg += `💰 ${isUz ? 'Daromadlar' : 'Доходы'}: *${formatAmount(totalInc)} сум*\n\n`;
    }

    const balance = totalInc - totalExp;
    msg += `📊 ${isUz ? 'Balans' : 'Баланс'}: *${balance >= 0 ? '+' : ''}${formatAmount(balance)} сум*\n`;
    msg += `📝 ${isUz ? 'Tranzaksiyalar' : 'Транзакций'}: ${transactions.length}`;

    await bot.telegram.sendMessage(user.telegramId, msg, { parse_mode: 'Markdown' });
  } catch (err) {
    // Пользователь мог заблокировать бота — молча пропускаем
    if (!err.message?.includes('bot was blocked')) {
      console.error('[WEEKLY REPORT] user:', user.telegramId, err.message);
    }
  }
};

/**
 * Запускает cron каждое воскресенье в 09:00 (UTC+5 = 04:00 UTC)
 */
const startWeeklyReportCron = (bot) => {
  // '0 4 * * 0' = каждое воскресенье в 04:00 UTC (09:00 Ташкент)
  cron.schedule('0 4 * * 0', async () => {
    console.log('[WEEKLY REPORT] Sending weekly reports...');
    try {
      const users = await User.find({ fullName: { $exists: true }, onboardingStep: { $exists: false } }).lean();
      let sent = 0;
      for (const user of users) {
        await sendWeeklyReport(bot, user);
        sent++;
        // Небольшая задержка чтобы не превысить лимиты Telegram
        await new Promise(r => setTimeout(r, 100));
      }
      console.log(`[WEEKLY REPORT] Sent to ${sent} users`);
    } catch (err) {
      console.error('[WEEKLY REPORT CRON]', err);
    }
  });

  console.log('[WEEKLY REPORT] Cron scheduled (every Sunday 09:00 Tashkent)');
};

module.exports = { startWeeklyReportCron };
