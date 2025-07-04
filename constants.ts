export const ORDER_STATUSES = {
  IN_PROGRESS: 'in-progress' as const,
  COMPLETED: 'completed' as const,
  UPDATED: 'updated' as const,
} as const;

export const USER_ROLES = {
  WAITER: 'waiter' as const,
  ADMIN: 'admin' as const,
} as const;

export const BUTTON_VARIANTS = {
  PRIMARY: 'btn-modern btn-primary',
  SUCCESS: 'btn-modern btn-success',
  DANGER: 'btn-modern btn-danger',
  SECONDARY: 'btn-modern btn-secondary',
  OUTLINE: 'btn-modern btn-outline',
} as const;

export const DEFAULT_USERS = [
  {
    id: '1',
    email: 'player1@themis.cafe',
    password: 'player1',
    role: 'waiter' as const,
    name: 'Player 1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'player2@themis.cafe',
    password: 'player2',
    role: 'waiter' as const,
    name: 'Player 2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'admin@themis.cafe',
    password: 'admin123',
    role: 'admin' as const,
    name: 'Jane Admin',
    createdAt: new Date().toISOString(),
  },
];

// Complete menu categories with all items
export const MENU_CATEGORIES = [
  'ЗАВТРАКИ',
  'САЛАТЫ', 
  'ПЕРВЫЕ БЛЮДА',
  'ВТОРЫЕ БЛЮДА',
  'НАЦИОНАЛЬНАЯ КУХНЯ',
  'ГАРНИРЫ',
  'БАР',
  'ШАШЛЫКИ',
  'БЛЮДА НА КОМПАНИЮ',
  'ФАСТФУД'
];

export const TABLES = Array.from({ length: 12 }, (_, i) => `Table ${i + 1}`);