const { customAlphabet } = require('nanoid');
const User = require('../../models/User');
const Family = require('../../models/Family');

// Генератор кода: только заглавные буквы и цифры, 6 символов
const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

/**
 * /create — создать семью
 */
const createFamilyHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });

    if (!user) {
      return ctx.reply('Сначала введите /start для регистрации.');
    }

    const t = require(`../../locales/${user.language}`);

    // Генерируем уникальный код
    let code;
    let attempts = 0;
    do {
      code = generateCode();
      attempts++;
      if (attempts > 10) throw new Error('Не удалось сгенерировать уникальный код');
    } while (await Family.findOne({ code }));

    // Создаём семью
    const family = await Family.create({
      code,
      ownerId: telegramId,
      members: [telegramId],
    });

    // Обновляем пользователя
    await User.updateOne({ telegramId }, { familyId: family._id });

    console.log('[BOT] family created:', code, 'by user:', telegramId);

    await ctx.reply(t.familyCreated(code), { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[CREATE FAMILY HANDLER]', err);
    const t = require('../../locales/ru');
    await ctx.reply(t.errorGeneral);
  }
};

/**
 * /join КОД — вступить в семью
 */
const joinFamilyHandler = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });

    if (!user) {
      return ctx.reply('Сначала введите /start для регистрации.');
    }

    const t = require(`../../locales/${user.language}`);

    // Извлекаем код из сообщения: "/join XK92PL" → "XK92PL"
    const parts = ctx.message.text.trim().split(/\s+/);
    const code = parts[1];

    if (!code) {
      return ctx.reply(t.joinUsage);
    }

    const family = await Family.findOne({ code: code.toUpperCase() });

    if (!family) {
      return ctx.reply(t.familyNotFound);
    }

    // Уже в этой семье?
    if (family.members.includes(telegramId)) {
      return ctx.reply(t.familyAlreadyMember);
    }

    // Добавляем пользователя в семью
    await Family.updateOne(
      { _id: family._id },
      { $addToSet: { members: telegramId } }
    );

    await User.updateOne({ telegramId }, { familyId: family._id });

    console.log('[BOT] user', telegramId, 'joined family:', code);

    await ctx.reply(t.familyJoined);
  } catch (err) {
    console.error('[JOIN FAMILY HANDLER]', err);
    const user = await User.findOne({ telegramId: ctx.from.id });
    const t = require(`../../locales/${user?.language || 'ru'}`);
    await ctx.reply(t.errorGeneral);
  }
};

module.exports = { createFamilyHandler, joinFamilyHandler };
