const { Markup } = require('telegraf');
const User = require('../../models/User');
const Family = require('../../models/Family');
const Transaction = require('../../models/Transaction');
const Card = require('../../models/Card');
const { parseTransaction } = require('../../utils/parser');
const { formatAmount, formatDate, getCategoryEmoji } = require('../../utils/format');
const { reportHandler } = require('./report');
const { getMainMenu } = require('./start');

// Тексты кнопок меню — блокируем их во время онбординга
const MENU_TEXTS = new Set([
  '📊 Отчёт', '📊 Hisobot',
  '👨‍👩‍👧 Семья', '👨‍👩‍👧 Oila',
  '⚙️ Настройки', '⚙️ Sozlamalar',
  '📱 Открыть приложение', '📱 Ilovani ochish',
  '💳 Карты', '💳 Kartalar',
]);

const maskCard = (num) => {
  const clean = (num || '').replace(/\D/g, '');
  return clean.length >= 4 ? `**** **** **** ${clean.slice(-4)}` : num;
};

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

    // ── Онбординг: ввод имени ───────────────────────────────────
    if (user.onboardingStep === 'awaiting_name') {
      // Защита: игнорируем кнопки меню
      if (MENU_TEXTS.has(text)) {
        const warn = user.language === 'uz'
          ? '⚠️ Avval ro\'yxatdan o\'ting.\n\n👤 Ism va familiyangizni kiriting:'
          : '⚠️ Сначала завершите регистрацию.\n\n👤 Введите ваше имя и фамилию:';
        const backLabel = user.language === 'uz' ? '← Orqaga (til)' : '← Назад (язык)';
        return ctx.reply(warn, {
          ...Markup.inlineKeyboard([[Markup.button.callback(backLabel, 'onb_back_lang')]]),
        });
      }
      const fullName = text.trim();
      if (fullName.length < 2) return ctx.reply(t.askName);
      await User.findOneAndUpdate({ telegramId }, { fullName, onboardingStep: 'awaiting_currency' });
      const backLabel = user.language === 'uz' ? '← Orqaga (ism)' : '← Назад (имя)';
      return ctx.reply(
        t.askCurrency(fullName),
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(t.btnSum, 'currency_sum'),
              Markup.button.callback(t.btnRub, 'currency_rub'),
            ],
            [Markup.button.callback(backLabel, 'onb_back_name')],
          ]),
        }
      );
    }

    // ── Онбординг: ввод номера карты ────────────────────────────
    if (user.onboardingStep === 'awaiting_card_number') {
      // Защита: игнорируем кнопки меню
      if (MENU_TEXTS.has(text)) {
        const warn = user.language === 'uz'
          ? '⚠️ Avval ro\'yxatdan o\'ting.\n\n💳 Karta raqamini kiriting:'
          : '⚠️ Сначала завершите регистрацию.\n\n💳 Введите номер карты:';
        const backLabel = user.language === 'uz' ? '← Orqaga (valyuta)' : '← Назад (валюта)';
        return ctx.reply(warn, {
          ...Markup.inlineKeyboard([[Markup.button.callback(backLabel, 'onb_back_currency')]]),
        });
      }
      const cardNumber = text.trim();
      if (cardNumber.length < 4) {
        const backLabel = user.language === 'uz' ? '← Orqaga (valyuta)' : '← Назад (валюта)';
        return ctx.reply(t.askCardNumber, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback(backLabel, 'onb_back_currency')]]),
        });
      }
      await User.findOneAndUpdate({ telegramId }, { tempCardNumber: cardNumber, onboardingStep: 'awaiting_card_balance' });
      const backLabel = user.language === 'uz' ? '← Orqaga (karta raqami)' : '← Назад (номер карты)';
      return ctx.reply(t.askCardBalance, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback(backLabel, 'onb_back_card_num')]]),
      });
    }

    // ── Онбординг: ввод баланса карты ───────────────────────────
    if (user.onboardingStep === 'awaiting_card_balance') {
      // Защита: игнорируем кнопки меню
      if (MENU_TEXTS.has(text)) {
        const warn = user.language === 'uz'
          ? '⚠️ Avval ro\'yxatdan o\'ting.\n\n💰 Kartadagi balansni kiriting:'
          : '⚠️ Сначала завершите регистрацию.\n\n💰 Введите баланс карты:';
        const backLabel = user.language === 'uz' ? '← Orqaga (karta raqami)' : '← Назад (номер карты)';
        return ctx.reply(warn, {
          ...Markup.inlineKeyboard([[Markup.button.callback(backLabel, 'onb_back_card_num')]]),
        });
      }
      const balance = parseFloat(text.replace(/[\s,]/g, ''));
      if (isNaN(balance) || balance < 0) {
        const backLabel = user.language === 'uz' ? '← Orqaga (karta raqami)' : '← Назад (номер карты)';
        return ctx.reply(t.askCardBalance, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback(backLabel, 'onb_back_card_num')]]),
        });
      }

      const currency = user.tempCardCurrency || user.currency || 'sum';
      const cardNumber = user.tempCardNumber || '';
      const holderName = user.fullName || user.firstName || '';

      const existingCount = await Card.countDocuments({ userId: telegramId });
      if (existingCount >= 5) {
        await User.findOneAndUpdate({ telegramId }, { $unset: { onboardingStep: 1, tempCardNumber: 1, tempCardCurrency: 1 } });
        return ctx.reply(t.maxCards);
      }

      await Card.updateMany({ userId: telegramId }, { isActive: false });
      await Card.create({ userId: telegramId, cardNumber, holderName, balance, currency, isActive: true });
      await User.findOneAndUpdate({ telegramId }, { $unset: { onboardingStep: 1, tempCardNumber: 1, tempCardCurrency: 1 } });

      const curLabel = currency === 'sum' ? 'сум' : 'руб';
      await ctx.reply(
        t.cardAdded(maskCard(cardNumber), holderName, formatAmount(balance), curLabel),
        { parse_mode: 'Markdown' }
      );
      return ctx.reply(t.menuApp, getMainMenu(t));
    }

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

    // ── Кнопка: Карты ─────────────────────────────────────────
    if (text === t.menuCards) {
      const { cardListHandler } = require('./cards');
      return cardListHandler(ctx);
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

    // Автообновление баланса активной карты
    const activeCard = await Card.findOne({ userId: telegramId, isActive: true });
    if (activeCard) {
      let delta = 0;
      if (parsed.type === 'expense') delta = -parsed.amount;
      else if (parsed.type === 'income') delta = parsed.amount;
      if (delta !== 0) {
        const updated = await Card.findByIdAndUpdate(activeCard._id, { $inc: { balance: delta } }, { new: true });
        const curLabel = updated.currency === 'sum' ? 'сум' : 'руб';
        replyText += `\n💳 Баланс: ${formatAmount(updated.balance)} ${curLabel}`;
      }
    }

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
