module.exports = {
  chooseLanguage: 'Tilni tanlang / Выберите язык:',
  btnRussian: '🇷🇺 Русский',
  btnUzbek: '🇺🇿 O\'zbek tili',

  askName: '👤 Ism va familiyangizni kiriting:',
  askCurrency: (name) => `✅ Ajoyib, *${name}*!\n\n💰 Karta valyutasini tanlang:`,
  btnSum: '🇺🇿 So\'m (UZS)',
  btnRub: '🇷🇺 Rubl (RUB)',

  askCardNumber: '💳 Karta raqamini kiriting:\n_(masalan: 8600 1234 5678 9012)_',
  askCardBalance: '💰 Kartadagi joriy balansni kiriting:\n_(masalan: 20000000)_',
  cardAdded: (num, holder, balance, cur) =>
    `✅ Karta qo'shildi!\n\n💳 *${num}*\n👤 ${holder}\n💰 ${balance} ${cur}\n\nEndi ishga tayyor! 🎉`,

  menuCards: '💳 Kartalar',
  noCards: '💳 Sizda kartalar yo\'q.\n\nKarta qo\'shing:',
  cardItem: (num, holder, balance, cur, active) =>
    `${active ? '✅ ' : ''}💳 *${num}*\n👤 ${holder}\n💰 ${balance} ${cur}`,
  btnActivate: '✅ Faollashtirish',
  btnDeleteCard: '🗑 O\'chirish',
  btnAddCard: '➕ Karta qo\'shish',
  cardActivated: '✅ Karta faollashtirildi!',
  cardDeleted: '🗑 Karta o\'chirildi.',
  maxCards: '⚠️ Maksimum 5 ta karta. Eski kartani o\'chiring.',
  askNewCardCurrency: '💱 Yangi karta valyutasini tanlang:',

  welcome: `Ajoyib! Shaxsiy moliyaviy rejim faollashtirildi 🎉

Men — sizning shaxsiy moliyaviy yordamchingizman. Men nima qila olaman:

📝 Xarajatlar va daromadlarni matnli xabarlardan yozib olish
📊 Hisobotlar va tahlillar tuzish
👨‍👩‍👧 Oilaviy byudjetni yuritish
📱 Qulay ilovani ochish

Shunchaki xarajat haqida yozing:
Taksi 15 000`,

  alreadyRegistered: 'Xush kelibsiz! Quyidagi menyudan foydalaning.',

  menuReport: '📊 Hisobot',
  menuFamily: '👨‍👩‍👧 Oila',
  menuSettings: '⚙️ Sozlamalar',
  menuApp: '📱 Ilovani ochish',

  expenseSaved: (amount, cat) =>
    `✅ Xarajat saqlandi\n\n💰 ${amount} so'm\n📂 ${cat}`,
  incomeSaved: (amount, cat) =>
    `✅ Daromad saqlandi\n\n💰 ${amount} so'm\n📂 ${cat}`,
  transferSaved: (amount) =>
    `✅ O'tkazma saqlandi\n\n💰 ${amount} so'm`,

  deleteButton: '❌ O\'chirish',

  familyCreated: (code) =>
    `👨‍👩‍👧 Oila yaratildi!\n\nSizning kodingiz: *${code}*\n\nUni oila a'zolariga /join ${code} buyrug'i bilan ulashing`,
  familyJoined: '✅ Siz oilaga qo\'shildingiz!',
  familyNotFound: '❌ Bunday kodli oila topilmadi.',
  familyAlreadyMember: 'ℹ️ Siz allaqachon bu oila a\'zosisiz.',
  familyUsage: 'Foydalaning:\n/create — oila yaratish\n/join KOD — oilaga qo\'shilish',

  joinUsage: 'Oila kodini ko\'rsating: /join KOD',

  reportHeader: (month, year) => `📊 ${year} yil ${month} oyi hisoboti`,
  reportExpenses: (total) => `💸 Xarajatlar: ${total} so'm`,
  reportIncomes: (total) => `💰 Daromadlar: ${total} so'm`,
  reportBalance: (balance) => `📈 Balans: ${balance > 0 ? '+' : ''}${balance} so'm`,
  reportFamily: (total) => `\n👨‍👩‍👧 Oilaviy xarajatlar: ${total} so'm`,
  reportEmpty: 'Bu oy uchun tranzaksiyalar topilmadi.',

  errorGeneral: '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
  errorNotRegistered: 'Ro\'yxatdan o\'tish uchun avval /start ni kiriting.',
};
