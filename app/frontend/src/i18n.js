export const translations = {
  ru: {
    // Навигация
    nav_home:        'ГЛАВНАЯ',
    nav_transaction: 'ТРАНЗАКЦИЯ',
    nav_analytics:   'АНАЛИТИКА',
    nav_profile:     'ПРОФИЛЬ',

    // Главная
    today:           'СЕГОДНЯ',
    expenses:        'РАСХОДЫ',
    incomes:         'ДОХОДЫ',
    add_actions:     'Добавить действия',
    expense:         'РАСХОД',
    income:          'ДОХОД',
    transfer:        'ПЕРЕВОД',
    last_expenses:   'ПОСЛЕДНИЕ РАСХОДЫ',
    last_incomes:    'ПОСЛЕДНИЕ ДОХОДЫ',
    today_expenses:  'Расходы на сегодня',
    family_transfers:'Семейные переводы',
    no_transactions: 'Транзакций нет',
    tap_to_add:      'Нажмите кнопку выше чтобы добавить',

    // Транзакции
    search:          'ПОИСК ТРАНЗАКЦИИ...',
    filter_all:      'ВСЕ',
    filter_expenses: 'Расходы',
    filter_incomes:  'ДОХОДЫ',
    filter_transfers:'ПЕРЕВОДЫ',
    found:           'НАЙДЕНЫ ТРАНЗАКЦИИ',
    not_found:       'Транзакции не найдены',

    // Аналитика
    year_label:      'год',
    calendar:        'КАЛЕНДАРЬ — нажмите на день',
    by_category:     'ПО КАТЕГОРИЯМ',
    dynamics:        'ДИНАМИКА',
    by_users:        'ПО ДНЯМ',
    no_data:         'Нет данных за этот период',
    total_expenses:  'ВСЕГО РАСХОДОВ',
    total_incomes:   'ВСЕГО ДОХОДОВ',
    no_tx_day:       'В этот день транзакций нет',

    // Профиль
    settings:        'НАСТРОЙКИ',
    settings_sub:    'имя, e-mail, Русский...',
    support:         'ПОДДЕРЖКА',
    support_sub:     'связь с разработчиком, баг-репорт',
    rate_bot:        'ОЦЕНИТЬ БОТА',
    leave_review:    'ОСТАВИТЬ ОТЗЫВ И ОЦЕНКУ',
    transactions_count: 'Транзакций',
    days_count:      'Дней',
    lang_label:      'ЯЗЫК',

    // Модал
    add_transaction: 'Добавить транзакцию',
    amount:          'Сумма',
    tx_name:         'Название транзакции',
    tx_name_hint:    'Например: коммуналка',
    category:        'Категория',
    description_opt: 'Описание (необязательно)',
    date:            'Дата',
    save:            'Сохранить',
    saving:          'Сохранение...',
    enter_amount:    'Введите сумму',
    save_error:      'Ошибка сохранения',
    thanks_rate:     'Спасибо за оценку!',

    // Периоды
    period_today:    'Сегодня',
    period_week:     'Неделя',
    period_month:    'Месяц',
  },

  uz: {
    // Navigatsiya
    nav_home:        'ASOSIY',
    nav_transaction: 'TO\'LOVLAR',
    nav_analytics:   'TAHLIL',
    nav_profile:     'PROFIL',

    // Asosiy
    today:           'BUGUN',
    expenses:        'XARAJATLAR',
    incomes:         'DAROMADLAR',
    add_actions:     'Amal qo\'shish',
    expense:         'XARAJAT',
    income:          'DAROMAD',
    transfer:        'O\'TKAZMA',
    last_expenses:   'SO\'NGI XARAJATLAR',
    last_incomes:    'SO\'NGI DAROMADLAR',
    today_expenses:  'Bugungi xarajatlar',
    family_transfers:'Oilaviy o\'tkazmalar',
    no_transactions: 'Tranzaksiyalar yo\'q',
    tap_to_add:      'Qo\'shish uchun yuqoridagi tugmani bosing',

    // Tranzaksiyalar
    search:          'TRANZAKSIYA QIDIRISH...',
    filter_all:      'HAMMASI',
    filter_expenses: 'Xarajatlar',
    filter_incomes:  'DAROMADLAR',
    filter_transfers:'O\'TKAZMALAR',
    found:           'TOPILGAN TRANZAKSIYALAR',
    not_found:       'Tranzaksiyalar topilmadi',

    // Tahlil
    year_label:      'yil',
    calendar:        'KALENDAR — kunni bosing',
    by_category:     'KATEGORIYALAR BO\'YICHA',
    dynamics:        'DINAMIKA',
    by_users:        'KUNLAR BO\'YICHA',
    no_data:         'Bu davr uchun ma\'lumot yo\'q',
    total_expenses:  'JAMI XARAJATLAR',
    total_incomes:   'JAMI DAROMADLAR',
    no_tx_day:       'Bu kunda tranzaksiyalar yo\'q',

    // Profil
    settings:        'SOZLAMALAR',
    settings_sub:    'ism, e-mail, O\'zbek...',
    support:         'YORDAM',
    support_sub:     'dasturchi bilan aloqa, xato xabar',
    rate_bot:        'BOTNI BAHOLASH',
    leave_review:    'FIKR VA BAHO QOLDIRISH',
    transactions_count: 'Tranzaksiya',
    days_count:      'Kun',
    lang_label:      'TIL',

    // Modal
    add_transaction: 'Tranzaksiya qo\'shish',
    amount:          'Miqdor',
    tx_name:         'Tranzaksiya nomi',
    tx_name_hint:    'Masalan: kommunal',
    category:        'Kategoriya',
    description_opt: 'Tavsif (ixtiyoriy)',
    date:            'Sana',
    save:            'Saqlash',
    saving:          'Saqlanmoqda...',
    enter_amount:    'Miqdorni kiriting',
    save_error:      'Saqlashda xatolik',
    thanks_rate:     'Baholаganingiz uchun rahmat!',

    // Davrlar
    period_today:    'Bugun',
    period_week:     'Hafta',
    period_month:    'Oy',
  },
};

export const t = (lang, key) => translations[lang]?.[key] ?? translations.ru[key] ?? key;
