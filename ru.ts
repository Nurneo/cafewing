export const ru = {
  // Navigation
  nav: {
    dashboard: 'Панель управления',
    profile: 'Профиль',
    settings: 'Настройки',
    orders: 'Заказы',
    menu: 'Меню',
    analytics: 'Аналитика',
    orderManagement: 'Управление заказами',
    tableManagement: 'Управление столами',
    newOrder: 'Новый заказ'
  },

  // Authentication
  auth: {
    login: 'Войти',
    logout: 'Выйти',
    signingOut: 'Выход из системы...',
    email: 'Электронная почта',
    password: 'Пароль',
    role: 'Роль',
    waiter: 'Официант',
    admin: 'Администратор',
    signingIn: 'Вход в систему...',
    quickAccess: 'Быстрый доступ',
    devMode: 'Режим разработки',
    manualLogin: 'Или войти вручную',
    invalidCredentials: 'Неверные учетные данные или несоответствие роли. Проверьте email, пароль и роль.',
    unexpectedError: 'Произошла неожиданная ошибка. Попробуйте еще раз.',
    fillAllFields: 'Пожалуйста, заполните все поля',
    demoLoginFailed: 'Демо-вход не удался. Убедитесь, что демо-аккаунты настроены в Supabase.',
    player1Waiter: 'Игрок 1 (Официант)',
    player2Waiter: 'Игрок 2 (Официант)',
    accessWaiterDashboard: 'Доступ к панели официанта',
    fullAdminAccess: 'Полный доступ к панели администратора',
    alternativeWaiterAccount: 'Альтернативный аккаунт официанта',
    usingSupabaseAuth: 'Использование реальной аутентификации Supabase с демо-аккаунтами',
    ensureDemoAccounts: 'Убедитесь, что демо-аккаунты созданы в вашем проекте Supabase',
    developmentTools: 'Инструменты разработки и учетные данные',
    consoleCommands: 'Команды консоли:',
    switchToAdmin: 'Переключиться на Администратора',
    switchToPlayer1: 'Переключиться на Игрока 1',
    switchToPlayer2: 'Переключиться на Игрока 2',
    demoAccountsNote: 'Примечание: Демо-аккаунты должны существовать в вашем Supabase Auth и таблице пользователей',
    // Code-based authentication
    enterCode: 'Введите код',
    accessCode: 'Код доступа',
    invalidCode: 'Неверный код доступа. Попробуйте еще раз.',
    codeRequired: 'Пожалуйста, введите код доступа',
    codePlaceholder: 'Введите код доступа',
    codeInstructions: 'Введите назначенный вам код доступа для входа в систему'
  },

  // Profile Page
  profile: {
    title: 'Профиль',
    settings: 'Настройки',
    subtitle: 'Управляйте настройками аккаунта и предпочтениями',
    personalInfo: 'Личная информация',
    accountSettings: 'Настройки аккаунта',
    accountActions: 'Действия с аккаунтом',
    appearance: 'Внешний вид',
    appearanceDescription: 'Настройте визуальную тему вашего рабочего пространства',
    language: 'Язык',
    languageDescription: 'Выберите предпочитаемый язык для приложения',
    stats: 'Личная статистика',
    statsComingSoon: 'Статистика скоро появится',
    statsDescription: 'Здесь будут отображаться ваши показатели производительности и сводка активности.',
    name: 'Имя',
    email: 'Электронная почта',
    role: 'Роль',
    memberSince: 'Участник с',
    lastLogin: 'Последний вход',
    saveChanges: 'Сохранить изменения',
    changesSaved: 'Изменения успешно сохранены!',
    errorSaving: 'Ошибка при сохранении изменений. Попробуйте еще раз.',
    currentLanguage: 'Текущий язык',
    selectLanguage: 'Выберите язык',
    currentTheme: 'Текущая тема',
    selectTheme: 'Выберите тему',
    lightTheme: 'Светлая тема',
    darkTheme: 'Темная тема',
    lightThemeDescription: 'Чистая и яркая для дневного использования',
    darkThemeDescription: 'Элегантная и современная для слабого освещения',
    themeDescription: 'Выберите между светлой и темной темами в соответствии с вашими предпочтениями и окружением',
    themeNote: 'Предпочтение темы',
    themeNoteDescription: 'Ваш выбор темы сохраняется автоматически и будет запомнен между сессиями. Обе темы сохраняют одинаковый профессиональный дизайн и функциональность.',
    lightFeature1: 'Яркий, воздушный интерфейс',
    lightFeature2: 'Высококонтрастный текст',
    lightFeature3: 'Идеально для ярких сред',
    darkFeature1: 'Снижение нагрузки на глаза',
    darkFeature2: 'Современные неоновые акценты',
    darkFeature3: 'Идеально для вечернего использования',
    signOut: 'Выйти',
    signOutDescription: 'Выйти из аккаунта и вернуться к экрану входа.'
  },

  // Common
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    cancel: 'Отмена',
    save: 'Сохранить',
    edit: 'Редактировать',
    delete: 'Удалить',
    view: 'Просмотр',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    search: 'Поиск',
    filter: 'Фильтр',
    export: 'Экспорт',
    import: 'Импорт',
    refresh: 'Обновить',
    close: 'Закрыть',
    confirm: 'Подтвердить',
    tryAgain: 'Попробовать снова',
    goHome: 'На главную',
    noData: 'Нет данных',
    comingSoon: 'Скоро',
    actions: 'Действия',
    status: 'Статус',
    name: 'Название',
    price: 'Цена',
    quantity: 'Количество',
    total: 'Итого',
    add: 'Добавить',
    remove: 'Удалить',
    update: 'Обновить',
    create: 'Создать',
    submit: 'Отправить'
  },

  // Orders
  orders: {
    title: 'Заказы',
    newOrder: 'Новый заказ',
    orderDetails: 'Детали заказа',
    tableNumber: 'Номер стола',
    status: 'Статус',
    items: 'Позиции',
    notes: 'Примечания',
    total: 'Итого',
    basePrice: 'Базовая цена',
    serviceFee: 'Сервисный сбор',
    serviceFeePercent: 'Сервисный сбор (15%)',
    createdBy: 'Создано',
    createdAt: 'Дата создания',
    waiter: 'Официант',
    time: 'Время',
    summary: 'Сводка',
    'in-progress': 'В процессе',
    'completed': 'Завершено',
    'updated': 'Обновлено',
    inProgress: 'В процессе',
    completed: 'Завершено',
    updated: 'Обновлено',
    filterByStatus: 'Фильтр по статусу',
    statusesShown: 'статусов показано',
    markCompleted: 'Отметить как завершенное',
    editOrder: 'Редактировать заказ',
    deleteOrder: 'Удалить заказ',
    orderCreated: 'Заказ успешно создан!',
    orderUpdated: 'Заказ успешно обновлен!',
    orderDeleted: 'Заказ успешно удален!',
    confirmDelete: 'Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.',
    noOrders: 'Заказы не найдены',
    ordersDescription: 'Заказы будут отображаться здесь после создания',
    selectTable: 'Выберите стол',
    selectMenuItems: 'Меню',
    selectedItems: 'Выбранные позиции',
    orderInfo: 'Информация о заказе',
    specialInstructions: 'Особые инструкции или примечания...',
    createOrder: 'Создать заказ',
    updateOrder: 'Обновить заказ',
    addItems: 'Добавить позиции',
    removeItem: 'Удалить позицию',
    updateQuantity: 'Обновить количество',
    selectMenuItem: 'Выберите позицию меню...',
    addItem: 'Добавить позицию',
    orderMustHaveItems: 'Заказ должен содержать хотя бы одну позицию',
    tableNumberRequired: 'Номер стола обязателен',
    updatedPricing: 'Обновленная цена',
    originalWaiter: 'Первоначальный официант',
    orderInformation: 'Информация о заказе',
    currentItems: 'Позиции заказа',
    pricingDetails: 'Детали ценообразования',
    adminNote: 'Примечание администратора: Вы можете изменить все аспекты этого заказа, включая номер стола, статус, примечания и позиции. Изменения будут сохранены немедленно и отражены во всей системе.',
    waiterNote: 'Примечание: Сохранение изменений автоматически обновит статус заказа на "Обновлено" и пересчитает цену на основе текущих цен меню.',
    saving: 'Сохранение...',
    showingOrders: 'Показано',
    ofOrders: 'из',
    ordersText: 'заказов',
    orderID: 'ID заказа',
    table: 'Стол',
    viewDetails: 'Просмотр деталей',
    markAsCompleted: 'Отметить как завершенное',
    done: 'Готово',
    del: 'Удал',
    each: 'за шт',
    eachPrice: 'за шт',
    // Table status translations
    tableAvailable: 'Доступен',
    tableOccupied: 'Занят',
    tableSelected: 'Выбран',
    tableOccupiedTooltip: 'Стол занят',
    tableOccupiedError: 'Этот стол в данный момент занят. Пожалуйста, выберите другой стол.',
    occupiedTablesCount: '{{count}} столов в данный момент занято'
  },

  // Menu
  menu: {
    title: 'Управление меню',
    description: 'Управляйте позициями меню ресторана с полной синхронизацией Supabase',
    addNewItem: 'Добавить новую позицию',
    editItem: 'Редактировать позицию меню',
    itemName: 'Название позиции',
    price: 'Цена',
    category: 'Категория',
    available: 'Доступно для заказа',
    unavailable: 'Недоступно',
    weight: 'Вес/Количество',
    weightOptional: 'например, 300гр, 2шт, 1л (необязательно)',
    weightDescription: 'Необязательное поле для указания веса, количества или объема',
    searchItems: 'Поиск позиций меню...',
    allCategories: 'Все категории',
    showUnavailable: 'Показать недоступные позиции',
    itemCreated: 'Позиция меню успешно создана!',
    itemUpdated: 'Позиция меню успешно обновлена!',
    itemDeleted: 'Позиция меню успешно удалена!',
    confirmDeleteItem: 'Вы уверены, что хотите удалить эту позицию меню? Это действие нельзя отменить.',
    noItems: 'Позиции меню не найдены',
    itemsDescription: 'Попробуйте изменить поиск или фильтры',
    enterItemName: 'Введите название позиции',
    enterPrice: 'Введите цену',
    realTimeSync: 'Включена синхронизация Supabase в реальном времени',
    syncDescription: 'Изменения будут немедленно синхронизированы на всех подключенных клиентах',
    updateItem: 'Обновить позицию',
    addItem: 'Добавить позицию',
    markAsUnavailable: 'Отметить как недоступное',
    markAsAvailable: 'Отметить как доступное',
    deleteItem: 'Удалить позицию',
    editItemAction: 'Редактировать позицию',
    showingItems: 'Показано',
    ofItems: 'из',
    itemsText: 'позиций',
    weightQuantity: 'Вес/Количество',
    statusAvailable: 'Доступно',
    statusUnavailable: 'Недоступно'
  },

  // Dashboard
  dashboard: {
    welcome: 'Добро пожаловать',
    adminDashboard: 'Администратор',
    waiterDashboard: 'Управление столами',
    totalOrders: 'Всего заказов',
    totalRevenue: 'Общая выручка',
    recentActivity: 'Недавняя активность',
    quickStats: 'Быстрая статистика',
    manageOrders: 'Управляйте заказами, меню и пользователями',
    manageOrdersEfficiently: 'Эффективно управляйте своими заказами',
    exportCSV: 'Экспорт CSV',
    pending: 'В ожидании',
    inProgress: 'В процессе',
    completed: 'Завершено',
    updated: 'Обновлено',
    orders: 'ЗАКАЗЫ',
    manageOrdersTab: 'УПРАВЛЕНИЕ ЗАКАЗАМИ',
    menuTab: 'МЕНЮ',
    analyticsTab: 'АНАЛИТИКА'
  },

  // Table Management
  table: {
    tableManagement: 'Управление столами',
    newOrder: 'Новый заказ'
  },

  // Languages
  languages: {
    en: 'English',
    ru: 'Русский'
  },

  // Errors
  errors: {
    pageNotFound: 'Страница не найдена',
    pageNotFoundDescription: 'Упс! Страница, которую вы ищете, похоже, потерялась, как официант в час пик. Давайте вернем вас туда, где происходит действие.',
    somethingWentWrong: 'Что-то пошло не так',
    unexpectedError: 'Произошла неожиданная ошибка. Попробуйте обновить страницу или обратитесь в службу поддержки, если проблема не исчезнет.',
    connectionError: 'Ошибка соединения',
    connectionErrorDescription: 'Не удается подключиться к серверу. Проверьте подключение к интернету и попробуйте еще раз.',
    loadingError: 'Не удалось загрузить данные. Попробуйте еще раз.',
    savingError: 'Не удалось сохранить изменения. Попробуйте еще раз.',
    orderNotFound: 'Заказ не найден. Этот заказ мог быть удален другим пользователем или больше не существует в системе.',
    needHelp: 'Нужна помощь?',
    helpDescription: 'Если вы считаете, что это ошибка, или у вас возникли проблемы с навигацией в системе управления кафе Themis, вот несколько быстрых ссылок, чтобы вернуть вас на правильный путь:',
    forWaiters: 'Для официантов',
    forAdmins: 'Для администраторов',
    waitersDescription: 'Управление столами и создание заказов',
    adminsDescription: 'Управление меню, заказами и аналитикой',
    validRoutes: 'Действительные маршруты:',
    redirectsToDashboard: 'Перенаправляет на панель управления',
    mainDashboard: 'Главная панель управления (в зависимости от роли)',
    loginPage: 'Страница входа (обходится в режиме разработки)',
    debugInfo: 'Отладочная информация',
    requestedPath: 'Запрошенный путь:',
    legitimateError: 'Это законная ошибка 404 для несопоставленного маршрута.',
    backToDashboard: 'Вернуться к панели управления',
    goBack: 'Назад'
  },

  // Categories (for menu)
  categories: {
    'ЗАВТРАКИ': 'ЗАВТРАКИ',
    'САЛАТЫ': 'САЛАТЫ',
    'ПЕРВЫЕ БЛЮДА': 'ПЕРВЫЕ БЛЮДА',
    'ВТОРЫЕ БЛЮДА': 'ВТОРЫЕ БЛЮДА',
    'НАЦИОНАЛЬНАЯ КУХНЯ': 'НАЦИОНАЛЬНАЯ КУХНЯ',
    'ГАРНИРЫ': 'ГАРНИРЫ',
    'БАР': 'БАР',
    'ШАШЛЫКИ': 'ШАШЛЫКИ',
    'БЛЮДА НА КОМПАНИЮ': 'БЛЮДА НА КОМПАНИЮ',
    'ФАСТФУД': 'ФАСТФУД'
  }
};