const { Telegraf } = require('telegraf');
const { startHandler, languageCallbackHandler, currencyCallbackHandler, newCardCurrencyCallbackHandler,
        onbBackLangHandler, onbBackNameHandler, onbBackCurrencyHandler, onbBackCardNumHandler } = require('./handlers/start');
const { createFamilyHandler, joinFamilyHandler } = require('./handlers/family');
const { messageHandler, deleteTransactionCallback } = require('./handlers/message');
const { reportHandler } = require('./handlers/report');
const { cardListHandler, cardActivateCallback, cardDeleteCallback, cardAddCallback } = require('./handlers/cards');
const { deleteAkkHandler } = require('./handlers/deleteakk');
const { exportHandler } = require('./handlers/export');

const createBot = () => {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error('BOT_TOKEN не задан в .env');
  }

  const bot = new Telegraf(token);

  // Команды
  bot.start(startHandler);
  bot.command('create', createFamilyHandler);
  bot.command('join', joinFamilyHandler);
  bot.command('report', reportHandler);
  bot.command('cards', cardListHandler);
  bot.command('deleteakk', deleteAkkHandler);
  bot.command('export',    exportHandler);

  // Callbacks
  bot.action(/^lang_(ru|uz)$/, languageCallbackHandler);
  bot.action(/^currency_(sum|rub)$/, currencyCallbackHandler);
  bot.action(/^newcard_currency_(sum|rub)$/, newCardCurrencyCallbackHandler);
  bot.action(/^card_activate_/, cardActivateCallback);
  bot.action(/^card_delete_/, cardDeleteCallback);
  bot.action('card_add', cardAddCallback);
  bot.action(/^delete_/, deleteTransactionCallback);

  // Кнопки НАЗАД во время онбординга
  bot.action('onb_back_lang',     onbBackLangHandler);
  bot.action('onb_back_name',     onbBackNameHandler);
  bot.action('onb_back_currency', onbBackCurrencyHandler);
  bot.action('onb_back_card_num', onbBackCardNumHandler);

  // Текстовые сообщения
  bot.on('text', messageHandler);

  // Обработка ошибок
  bot.catch((err, ctx) => {
    console.error('[BOT] Unhandled error for', ctx.updateType, err);
  });

  return bot;
};

module.exports = createBot;
