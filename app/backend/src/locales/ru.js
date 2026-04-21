module.exports = {
  chooseLanguage: 'Выберите язык / Tilni tanlang:',
  btnRussian: '🇷🇺 Русский',
  btnUzbek: '🇺🇿 O\'zbek tili',

  askName: '👤 Введите ваше имя и фамилию:',
  askCurrency: (name) => `✅ Отлично, *${name}*!\n\n💰 Выберите валюту карты:`,
  btnSum: '🇺🇿 Сум (UZS)',
  btnRub: '🇷🇺 Рубль (RUB)',

  askCardNumber: '💳 Введите номер карты:\n_(например: 8600 1234 5678 9012)_',
  askCardBalance: '💰 Введите текущий баланс карты:\n_(например: 20000000)_',
  cardAdded: (num, holder, balance, cur) =>
    `✅ Карта добавлена!\n\n💳 *${num}*\n👤 ${holder}\n💰 ${balance} ${cur}\n\nТеперь вы готовы к работе! 🎉`,

  menuCards: '💳 Карты',
  noCards: '💳 У вас нет карт.\n\nДобавьте карту:',
  cardItem: (num, holder, balance, cur, active) =>
    `${active ? '✅ ' : ''}💳 *${num}*\n👤 ${holder}\n💰 ${balance} ${cur}`,
  btnActivate: '✅ Сделать активной',
  btnDeleteCard: '🗑 Удалить',
  btnAddCard: '➕ Добавить карту',
  cardActivated: '✅ Карта активирована!',
  cardDeleted: '🗑 Карта удалена.',
  maxCards: '⚠️ Максимум 5 карт. Удалите старую карту.',
  askNewCardCurrency: '💱 Выберите валюту новой карты:',

  welcome: `Отлично! Личный финансовый режим активирован 🎉

Я — ваш персональный финансовый помощник. Вот что я умею:

📝 Записывать расходы и доходы из текстовых сообщений
📊 Строить отчёты и аналитику
👨‍👩‍👧 Вести семейный бюджет
📱 Открывать удобное приложение

Просто напишите мне о расходе:
Такси 15 000`,

  alreadyRegistered: 'С возвращением! Используйте меню ниже.',

  menuReport: '📊 Отчёт',
  menuFamily: '👨‍👩‍👧 Семья',
  menuSettings: '⚙️ Настройки',
  menuApp: '📱 Открыть приложение',

  expenseSaved: (amount, cat) =>
    `✅ Расход записан\n\n💰 ${amount} сум\n📂 ${cat}`,
  incomeSaved: (amount, cat) =>
    `✅ Доход записан\n\n💰 ${amount} сум\n📂 ${cat}`,
  transferSaved: (amount) =>
    `✅ Перевод записан\n\n💰 ${amount} сум`,

  deleteButton: '❌ Удалить',

  familyCreated: (code) =>
    `👨‍👩‍👧 Семья создана!\n\nВаш код: *${code}*\n\nПоделитесь им с членами семьи командой /join ${code}`,
  familyJoined: '✅ Вы вступили в семью!',
  familyNotFound: '❌ Семья с таким кодом не найдена.',
  familyAlreadyMember: 'ℹ️ Вы уже состоите в этой семье.',
  familyUsage: 'Используйте:\n/create — создать семью\n/join КОД — вступить в семью',

  joinUsage: 'Укажите код семьи: /join КОД',

  reportHeader: (month, year) => `📊 Отчёт за ${month} ${year}`,
  reportExpenses: (total) => `💸 Расходы: ${total} сум`,
  reportIncomes: (total) => `💰 Доходы: ${total} сум`,
  reportBalance: (balance) => `📈 Баланс: ${balance > 0 ? '+' : ''}${balance} сум`,
  reportFamily: (total) => `\n👨‍👩‍👧 Семейные расходы: ${total} сум`,
  reportEmpty: 'За этот месяц транзакций не найдено.',

  errorGeneral: '❌ Произошла ошибка. Попробуйте снова.',
  errorNotRegistered: 'Сначала введите /start для регистрации.',
};
