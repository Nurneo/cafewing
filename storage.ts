import { Order, User, MenuItem } from '../types';
import { parseItemsString } from './helpers';

const STORAGE_KEYS = {
  ORDERS: 'themis_orders',
  USERS: 'themis_users',
  CURRENT_USER: 'themis_current_user',
  THEME: 'themis_theme',
  MENU_ITEMS: 'themis_menu_items',
} as const;

export const storage = {
  // Orders
  getOrders: (): Order[] => {
    const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!orders) return [];
    
    try {
      const parsedOrders = JSON.parse(orders);
      // Ensure items are always arrays and sort by timestamp (newest first)
      const ordersWithItems = parsedOrders.map((order: any) => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : parseItemsString(order.items || ''),
        displayId: order.displayId || 1, // Ensure displayId exists
      }));
      
      // Sort by timestamp in descending order (newest first)
      return ordersWithItems.sort((a: Order, b: Order) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error parsing orders from storage:', error);
      return [];
    }
  },

  saveOrders: (orders: Order[]): void => {
    // Sort orders by timestamp before saving (newest first)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sortedOrders));
  },

  // Users
  getUsers: (): User[] => {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  saveUsers: (users: User[]): void => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Current User
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  saveCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Theme
  getTheme: (): 'light' | 'dark' | null => {
    return localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
  },

  saveTheme: (theme: 'light' | 'dark'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Menu Items
  getMenuItems: (): MenuItem[] => {
    const items = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return items ? JSON.parse(items) : [];
  },

  saveMenuItems: (items: MenuItem[]): void => {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
  },

  // Export data with proper order ID handling
  exportOrdersAsCSV: (orders: Order[]): string => {
    const headers = ['Order ID', 'Table Number', 'Items', 'Status', 'Notes', 'Base Price', 'Service Fee Price', 'Timestamp', 'Created By'];
    const csvContent = [
      headers.join(','),
      ...orders.map((order) => [
        order.displayId, // Use displayId instead of array index
        order.tableNumber,
        `"${order.items.map(item => `${item.name} x${item.quantity}`).join('; ').replace(/"/g, '""')}"`,
        order.status,
        `"${(order.notes || '').replace(/"/g, '""')}"`,
        order.basePrice,
        order.serviceFeePrice,
        order.timestamp,
        order.createdBy
      ].join(','))
    ].join('\n');
    
    return csvContent;
  },

  downloadCSV: (csvContent: string, filename: string): void => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};