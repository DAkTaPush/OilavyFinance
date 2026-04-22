const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Card = require('../../models/Card');
const Family = require('../../models/Family');

/**
 * /deleteakk — полное удаление аккаунта и всех данных
 */
const deleteAkkHandler = async (ctx) => {
  const telegramId = ctx.from.id;

  try {
    // 1. Удаляем команду пользователя из чата
    try { await ctx.deleteMessage(); } catch (_) {}

    // 2. Удаляем все транзакции
    await Transaction.deleteMany({ userId: telegramId });

    // 3. Удаляем все карты
    await Card.deleteMany({ userId: telegramId });

    // 4. Убираем из семьи или удаляем семью если владелец
    const user = await User.findOne({ telegramId });
    if (user?.familyId) {
      const family = await Family.findById(user.familyId);
      if (family) {
        if (family.ownerId === telegramId) {
          // Владелец — удаляем всю семью и убираем familyId у всех участников
          await User.updateMany({ familyId: user.familyId }, { $unset: { familyId: 1 } });
          await Family.deleteOne({ _id: user.familyId });
        } else {
          // Просто участник — убираем из списка
          await Family.findByIdAndUpdate(user.familyId, {
            $pull: { members: telegramId },
          });
        }
      }
    }

    // 5. Удаляем пользователя
    await User.deleteOne({ telegramId });

    // 6. Отправляем сообщение об удалении и сразу его удаляем
    const msg = await ctx.reply('🗑');
    setTimeout(async () => {
      try { await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id); } catch (_) {}
    }, 3000);

    console.log('[BOT] account deleted for user:', telegramId);
  } catch (err) {
    console.error('[DELETEAKK]', err);
    try {
      const msg = await ctx.reply('❌');
      setTimeout(async () => {
        try { await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id); } catch (_) {}
      }, 3000);
    } catch (_) {}
  }
};

module.exports = { deleteAkkHandler };
