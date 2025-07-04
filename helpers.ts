import { OrderItem } from '../types';

export const parseItemsString = (itemsString: string): OrderItem[] => {
  if (!itemsString.trim()) return [];
  
  return itemsString.split(',').map(item => {
    const trimmedItem = item.trim();
    const match = trimmedItem.match(/^(.+?)\s*x(\d+)(?:\s*-\s*(\d+)с)?$/);
    
    if (match) {
      const [, name, quantity, price] = match;
      return {
        name: name.trim(),
        quantity: parseInt(quantity, 10),
        price: price ? parseInt(price, 10) : 0,
      };
    }
    
    // Fallback for simple format
    return {
      name: trimmedItem,
      quantity: 1,
      price: 0,
    };
  });
};