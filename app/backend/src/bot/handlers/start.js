const { Markup } = require('telegraf');
const User = require('../../models/User');

/**
 * Генерирует reply keyboard главного меню
 */
const getMainMenu = (t) =>
  Markup.keyboard([
    [t.menuReport, t.menuFamily],
    [t.menuSettings, t.menuApp],
  ]).resize();

/**
 * /start — регистрация и выбор языка
 */
const startHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    console.log('[BOT] /start from user:', telegramId);

    const existingUser = await User.findOne({ telegramId });

    // Всегда показываем выбор языка (новый и существующий пользователь)
    const ruLocale = require('../../locales/ru');
    await ctx.reply(
      ruLocale.chooseLanguage,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(ruLocale.btnRussian, 'lang_ru'),
          Markup.button.callback(ruLocale.btnUzbek, 'lang_uz'),
        ],
      ])
    );
  } catch (err) {
    console.error('[START HANDLER]', err);
    await ctx.reply('Произошла ошибка. Попробуйте снова.');
  }
};

/**
 * Callback: выбор языка (lang_ru / lang_uz)
 */
const languageCallbackHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const language = ctx.callbackQuery.data === 'lang_ru' ? 'ru' : 'uz';
    const t = require(`../../locales/${language}`);

    console.log('[BOT] language selected:', language, 'user:', telegramId);

    const existingUser = await User.findOne({ telegramId });
    const isNew = !existingUser;
    const isOnboarded = existingUser && existingUser.fullName && !existingUser.onboardingStep;

    await User.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        username: ctx.from.username || null,
        firstName: ctx.from.first_name || '',
        language,
        ...(isNew && { onboardingStep: 'awaiting_name' }),
      },
      { upsert: true, new: true }
    );

    await ctx.answerCbQuery();

    if (!isNew && isOnboarded) {
      await ctx.editMessageText(t.alreadyRegistered);
      await ctx.reply(t.menuApp, getMainMenu(t));
      return;
    }

    await ctx.editMessageText(t.askName, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[LANGUAGE CALLBACK]', err);
    await ctx.answerCbQuery();
    await ctx.reply('Произошла ошибка. Попробуйте снова.');
  }
};

/**
 * Callback: выбор валюты (currency_sum / currency_rub)
 */
const currencyCallbackHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const currency = ctx.callbackQuery.data === 'currency_sum' ? 'sum' : 'rub';
    const currencyLabel = currency === 'sum' ? 'Сум (UZS)' : 'Рубль (RUB)';

    const user = await User.findOne({ telegramId });
    if (!user) {
      await ctx.answerCbQuery();
      return ctx.reply('Введите /start для регистрации.');
    }

    const t = require(`../../locales/${user.language}`);
    const fullName = user.fullName || ctx.from.first_name || '';

    await User.findOneAndUpdate({ telegramId }, { currency, onboardingStep: null });

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      t.currencySet(fullName, currencyLabel),
      { parse_mode: 'Markdown' }
    );
    await ctx.reply(t.menuApp, getMainMenu(t));
  } catch (err) {
    console.error('[CURRENCY CALLBACK]', err);
    await ctx.answerCbQuery();
    await ctx.reply('Произошла ошибка. Попробуйте снова.');
  }
};

module.exports = { startHandler, languageCallbackHandler, currencyCallbackHandler, getMainMenu };
