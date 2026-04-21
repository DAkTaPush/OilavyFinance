const { Markup } = require('telegraf');
const User = require('../../models/User');
const Card = require('../../models/Card');
const { formatAmount } = require('../../utils/format');
const { getMainMenu } = require('./start');

const maskCard = (num) => {
  const clean = (num || '').replace(/\D/g, '');
  return clean.length >= 4 ? `**** **** **** ${clean.slice(-4)}` : num;
};

const buildCardMessage = (card, t) => {
  const curLabel = card.currency === 'sum' ? 'сум' : 'руб';
  return t.cardItem(
    maskCard(card.cardNumber),
    card.holderName,
    formatAmount(card.balance),
    curLabel,
    card.isActive
  );
};

/**
 * Показать список карт пользователя
 */
const cardListHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });
    if (!user) return ctx.reply('Введите /start');

    const t = require(`../../locales/${user.language}`);
    const cards = await Card.find({ userId: telegramId }).sort({ createdAt: 1 });

    if (!cards.length) {
      return ctx.reply(
        t.noCards,
        Markup.inlineKeyboard([[Markup.button.callback(t.btnAddCard, 'card_add')]])
      );
    }

    for (const card of cards) {
      const buttons = [];
      if (!card.isActive) {
        buttons.push(Markup.button.callback(t.btnActivate, `card_activate_${card._id}`));
      }
      buttons.push(Markup.button.callback(t.btnDeleteCard, `card_delete_${card._id}`));
      await ctx.reply(
        buildCardMessage(card, t),
        { parse_mode: 'Markdown', ...Markup.inlineKeyboard([buttons]) }
      );
    }

    if (cards.length < 5) {
      await ctx.reply(
        `💳 ${cards.length}/5`,
        Markup.inlineKeyboard([[Markup.button.callback(t.btnAddCard, 'card_add')]])
      );
    }
  } catch (err) {
    console.error('[CARDS LIST]', err);
    await ctx.reply('❌ Ошибка. Попробуйте снова.');
  }
};

/**
 * Callback: активировать карту
 */
const cardActivateCallback = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const cardId = ctx.callbackQuery.data.replace('card_activate_', '');
    const user = await User.findOne({ telegramId });
    const t = require(`../../locales/${user.language}`);

    await Card.updateMany({ userId: telegramId }, { isActive: false });
    await Card.findByIdAndUpdate(cardId, { isActive: true });

    const updated = await Card.findById(cardId);
    await ctx.answerCbQuery(t.cardActivated);
    await ctx.editMessageText(buildCardMessage(updated, t), { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[CARD ACTIVATE]', err);
    await ctx.answerCbQuery('Ошибка');
  }
};

/**
 * Callback: удалить карту
 */
const cardDeleteCallback = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const cardId = ctx.callbackQuery.data.replace('card_delete_', '');
    const user = await User.findOne({ telegramId });
    const t = require(`../../locales/${user.language}`);

    const card = await Card.findOne({ _id: cardId, userId: telegramId });
    if (!card) { await ctx.answerCbQuery(); return; }

    const wasActive = card.isActive;
    await Card.deleteOne({ _id: cardId });

    if (wasActive) {
      const next = await Card.findOne({ userId: telegramId }).sort({ createdAt: -1 });
      if (next) await Card.findByIdAndUpdate(next._id, { isActive: true });
    }

    await ctx.answerCbQuery(t.cardDeleted);
    await ctx.editMessageText(`🗑 ${t.cardDeleted}`);
  } catch (err) {
    console.error('[CARD DELETE]', err);
    await ctx.answerCbQuery('Ошибка');
  }
};

/**
 * Callback: добавить карту (card_add)
 */
const cardAddCallback = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });
    if (!user) { await ctx.answerCbQuery(); return; }

    const t = require(`../../locales/${user.language}`);
    const count = await Card.countDocuments({ userId: telegramId });

    if (count >= 5) {
      await ctx.answerCbQuery(t.maxCards);
      return;
    }

    await ctx.answerCbQuery();
    await ctx.reply(
      t.askNewCardCurrency,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(t.btnSum, 'newcard_currency_sum'),
          Markup.button.callback(t.btnRub, 'newcard_currency_rub'),
        ],
      ])
    );
  } catch (err) {
    console.error('[CARD ADD]', err);
    await ctx.answerCbQuery('Ошибка');
  }
};

module.exports = { cardListHandler, cardActivateCallback, cardDeleteCallback, cardAddCallback };
