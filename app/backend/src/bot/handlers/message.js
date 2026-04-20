const { Markup } = require('telegraf');
const User = require('../../models/User');
const Family = require('../../models/Family');
const Transaction = require('../../models/Transaction');
const { parseTransaction } = require('../../utils/parser');
const { formatAmount, formatDate, getCategoryEmoji } = require('../../utils/format');
const { reportHandler } = require('./report');

const MINI_APP_URL = process.env.MINI_APP_URL || 'http://localhost:5173';

/**
 * Обработчик текстовых сообщений — меню + парсинг транзакций
 */
const messageHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const text = ctx.message.text;

    if (text.startsWith('/')) return;

    const user = await User.findOne({ telegramId });
    if (!user) {
      return ctx.reply('Сначала введите /start для регистрации.');
    }

    const t = require(`../../locales/${user.language}`);

    // ── Кнопка: Отчёт ──────────────────────────────────────────
    if (text === t.menuReport) {
      return reportHandler(ctx);
    }

    // ── Кнопка: Семья ──────────────────────────────────────────
    if (text === t.menuFamily) {
      if (!user.familyId) {
        return ctx.reply(
          t.familyUsage,
          Markup.keyboard([
            [t.menuReport, t.menuFamily],
            [t.menuSettings, t.menuApp],
          ]).resize()
        );
      }
      const family = await Family.findById(user.familyId).lean();
      if (!family) {
        return ctx.reply(t.familyUsage);
      }
      const memberCount = family.members?.length || 1;
      const msg = user.language === 'uz'
        ? `👨‍👩‍👧 Oila kodi: *${family.code}*\n👥 A'zolar: ${memberCount} ta\n\nYangi a'zo qo'shish uchun kodni ulashing:\n/join ${family.code}`
        : `👨‍👩‍👧 Код семьи: *${family.code}*\n👥 Участников: ${memberCount}\n\nПоделитесь кодом для вступления:\n/join ${family.code}`;
      return ctx.reply(msg, { parse_mode: 'Markdown' });
    }

    // ── Кнопка: Настройки ──────────────────────────────────────
    if (text === t.menuSettings) {
      const msg = user.language === 'uz'
        ? `⚙️ *Sozlamalar*\n\n🌐 Til: O'zbek\n👤 Ism: ${user.firstName || '—'}\n\nTilni o'zgartirish uchun /start ni bosing.`
        : `⚙️ *Настройки*\n\n🌐 Язык: Русский\n👤 Имя: ${user.firstName || '—'}\n\nДля смены языка введите /start.`;
      return ctx.reply(msg, { parse_mode: 'Markdown' });
    }

    // ── Кнопка: Открыть приложение ─────────────────────────────
    if (text === t.menuApp) {
      const msg = user.language === 'uz'
        ? '📱 Ilovani ochish uchun quyidagi tugmani bosing:'
        : '📱 Нажмите кнопку ниже чтобы открыть приложение:';
      const isHttps = MINI_APP_URL.startsWith('https://');
      const btn = isHttps
        ? Markup.button.webApp('📱 OilavyFinance', MINI_APP_URL)
        : Markup.button.url('📱 OilavyFinance (открыть)', MINI_APP_URL);
      return ctx.reply(msg, Markup.inlineKeyboard([[btn]]));
    }

    // ── Парсинг транзакции ─────────────────────────────────────
    const parsed = parseTransaction(text);
    if (!parsed) return;

    const transaction = await Transaction.create({
      userId: telegramId,
      familyId: user.familyId || null,
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      date: new Date(),
    });

    console.log('[BOT] transaction saved:', parsed.type, parsed.amount, 'user:', telegramId);

    const emoji = getCategoryEmoji(parsed.category);
    const formattedAmount = formatAmount(parsed.amount);
    const formattedDate = formatDate(transaction.date);

    let replyText;
    if (parsed.type === 'income') {
      replyText = t.incomeSaved(formattedAmount, `${emoji} ${parsed.category}`);
    } else if (parsed.type === 'transfer') {
      replyText = t.transferSaved(formattedAmount);
    } else {
      replyText = t.expenseSaved(formattedAmount, `${emoji} ${parsed.category}`);
    }

    replyText += `\n📅 ${formattedDate}`;

    await ctx.reply(
      replyText,
      Markup.inlineKeyboard([
        [Markup.button.callback(t.deleteButton, `delete_${transaction._id}`)],
      ])
    );
  } catch (err) {
    console.error('[MESSAGE HANDLER]', err);
    await ctx.reply('❌ Произошла ошибка. Попробуйте снова.');
  }
};

/**
 * Callback: удалить транзакцию
 */
const deleteTransactionCallback = async (ctx) => {
  try {
    const transactionId = ctx.callbackQuery.data.replace('delete_', '');
    const telegramId = ctx.from.id;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: telegramId,
    });

    if (!transaction) {
      await ctx.answerCbQuery('Транзакция не найдена');
      return;
    }

    await Transaction.deleteOne({ _id: transactionId });
    await ctx.answerCbQuery('✅ Удалено');
    await ctx.editMessageText('❌ Транзакция удалена');

    console.log('[BOT] transaction deleted:', transactionId, 'user:', telegramId);
  } catch (err) {
    console.error('[DELETE CALLBACK]', err);
    await ctx.answerCbQuery('Ошибка при удалении');
  }
};

module.exports = { messageHandler, deleteTransactionCallback };
