const { Telegraf } = require('telegraf');
const { startHandler, languageCallbackHandler, currencyCallbackHandler } = require('./handlers/start');
const { createFamilyHandler, joinFamilyHandler } = require('./handlers/family');
const { messageHandler, deleteTransactionCallback } = require('./handlers/message');
const { reportHandler } = require('./handlers/report');

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

  // Callbacks
  bot.action(/^lang_(ru|uz)$/, languageCallbackHandler);
  bot.action(/^currency_(sum|rub)$/, currencyCallbackHandler);
  bot.action(/^delete_/, deleteTransactionCallback);

  // Текстовые сообщения
  bot.on('text', messageHandler);

  // Обработка ошибок
  bot.catch((err, ctx) => {
    console.error('[BOT] Unhandled error for', ctx.updateType, err);
  });

  return bot;
};

module.exports = createBot;
