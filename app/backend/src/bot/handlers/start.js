const { Markup } = require('telegraf');
const User = require('../../models/User');

// Кнопка НАЗАД под каждым шагом онбординга
const backBtn = (label, action) =>
  Markup.inlineKeyboard([[Markup.button.callback(label, action)]]);

/**
 * Генерирует reply keyboard главного меню
 */
const getMainMenu = (t) =>
  Markup.keyboard([
    [t.menuReport, t.menuFamily],
    [t.menuCards, t.menuSettings],
    [t.menuApp],
  ]).resize();

/**
 * /start — регистрация и выбор языка
 */
const startHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    console.log('[BOT] /start from user:', telegramId);

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
    const isOnboarded = existingUser && existingUser.fullName && !existingUser.onboardingStep;

    await User.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        username: ctx.from.username || null,
        firstName: ctx.from.first_name || '',
        language,
        ...(!isOnboarded && { onboardingStep: 'awaiting_name' }),
      },
      { upsert: true, new: true }
    );

    await ctx.answerCbQuery();

    if (isOnboarded) {
      await ctx.editMessageText(t.alreadyRegistered);
      await ctx.reply(t.menuApp, getMainMenu(t));
      return;
    }

    // Шаг 1: имя + кнопка НАЗАД (к выбору языка)
    const backLabel = language === 'uz' ? '← Orqaga (til)' : '← Назад (язык)';
    await ctx.editMessageText(t.askName, {
      parse_mode: 'Markdown',
      ...backBtn(backLabel, 'onb_back_lang'),
    });
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

    const user = await User.findOne({ telegramId });
    if (!user) {
      await ctx.answerCbQuery();
      return ctx.reply('Введите /start для регистрации.');
    }

    const t = require(`../../locales/${user.language}`);
    await User.findOneAndUpdate({ telegramId }, { currency, onboardingStep: 'awaiting_card_number' });

    await ctx.answerCbQuery();

    // Шаг 3: номер карты + кнопка НАЗАД (к выбору валюты)
    const backLabel = user.language === 'uz' ? '← Orqaga (valyuta)' : '← Назад (валюта)';
    await ctx.editMessageText(t.askCardNumber, {
      parse_mode: 'Markdown',
      ...backBtn(backLabel, 'onb_back_currency'),
    });
  } catch (err) {
    console.error('[CURRENCY CALLBACK]', err);
    await ctx.answerCbQuery();
    await ctx.reply('Произошла ошибка. Попробуйте снова.');
  }
};

/**
 * Callback: валюта новой карты (newcard_currency_sum / newcard_currency_rub)
 */
const newCardCurrencyCallbackHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const currency = ctx.callbackQuery.data === 'newcard_currency_sum' ? 'sum' : 'rub';

    const user = await User.findOne({ telegramId });
    if (!user) { await ctx.answerCbQuery(); return; }

    const t = require(`../../locales/${user.language}`);
    await User.findOneAndUpdate({ telegramId }, { tempCardCurrency: currency, onboardingStep: 'awaiting_card_number' });

    await ctx.answerCbQuery();
    await ctx.editMessageText(t.askCardNumber, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[NEW CARD CURRENCY]', err);
    await ctx.answerCbQuery();
  }
};

// ── BACK callbacks ─────────────────────────────────────────────────────────

/** Назад → выбор языка */
const onbBackLangHandler = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const ruLocale = require('../../locales/ru');
    await ctx.editMessageText(ruLocale.chooseLanguage, {
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(ruLocale.btnRussian, 'lang_ru'),
          Markup.button.callback(ruLocale.btnUzbek, 'lang_uz'),
        ],
      ]),
    });
  } catch (err) {
    console.error('[ONB_BACK_LANG]', err);
    await ctx.answerCbQuery();
  }
};

/** Назад → ввод имени */
const onbBackNameHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });
    const lang = user?.language || 'ru';
    const t = require(`../../locales/${lang}`);

    await User.findOneAndUpdate({ telegramId }, { onboardingStep: 'awaiting_name' });
    await ctx.answerCbQuery();

    const backLabel = lang === 'uz' ? '← Orqaga (til)' : '← Назад (язык)';
    await ctx.editMessageText(t.askName, {
      parse_mode: 'Markdown',
      ...backBtn(backLabel, 'onb_back_lang'),
    });
  } catch (err) {
    console.error('[ONB_BACK_NAME]', err);
    await ctx.answerCbQuery();
  }
};

/** Назад → выбор валюты */
const onbBackCurrencyHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });
    const lang = user?.language || 'ru';
    const t = require(`../../locales/${lang}`);
    const fullName = user?.fullName || '';

    await User.findOneAndUpdate({ telegramId }, { onboardingStep: 'awaiting_currency' });
    await ctx.answerCbQuery();

    const backLabel = lang === 'uz' ? '← Orqaga (ism)' : '← Назад (имя)';
    await ctx.editMessageText(t.askCurrency(fullName), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t.btnSum, 'currency_sum'), Markup.button.callback(t.btnRub, 'currency_rub')],
        [Markup.button.callback(backLabel, 'onb_back_name')],
      ]),
    });
  } catch (err) {
    console.error('[ONB_BACK_CURRENCY]', err);
    await ctx.answerCbQuery();
  }
};

/** Назад → ввод номера карты */
const onbBackCardNumHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });
    const lang = user?.language || 'ru';
    const t = require(`../../locales/${lang}`);

    await User.findOneAndUpdate({ telegramId }, { onboardingStep: 'awaiting_card_number' });
    await ctx.answerCbQuery();

    const backLabel = lang === 'uz' ? '← Orqaga (valyuta)' : '← Назад (валюта)';
    await ctx.editMessageText(t.askCardNumber, {
      parse_mode: 'Markdown',
      ...backBtn(backLabel, 'onb_back_currency'),
    });
  } catch (err) {
    console.error('[ONB_BACK_CARD_NUM]', err);
    await ctx.answerCbQuery();
  }
};

module.exports = {
  startHandler,
  languageCallbackHandler,
  currencyCallbackHandler,
  newCardCurrencyCallbackHandler,
  getMainMenu,
  onbBackLangHandler,
  onbBackNameHandler,
  onbBackCurrencyHandler,
  onbBackCardNumHandler,
};
