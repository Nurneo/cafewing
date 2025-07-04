import { supabase, withRetry, getCurrentUserId } from '../lib/supabase';
import type { User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import type { Order, MenuItem, User } from '../types';
import { orderIdManager } from '../utils/orderIdManager';

type Tables = Database['public']['Tables'];
type UserRow = Tables['users']['Row'];
type OrderRow = Tables['orders']['Row'];
type MenuItemRow = Tables['menu_items']['Row'];
type OrderItemRow = Tables['order_items']['Row'];

// Enhanced logging
const logWithTimestamp = (message: string, data?: any) => {
  const timestamp = new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dhaka',
    hour12: false 
  });
  console.log(`[${timestamp} +06] SupabaseService: ${message}`, data || '');
};

// Helper function to map OrderRow to Order type
const mapOrderRowToOrder = async (orderRow: OrderRow, displayId: number): Promise<Order> => {
  // Fetch order items
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderRow.id);

  if (itemsError) {
    logWithTimestamp('Error fetching order items', itemsError);
    throw itemsError;
  }

  // Fetch waiter info - use maybeSingle() to handle missing waiter gracefully
  const { data: waiter, error: waiterError } = await supabase
    .from('users')
    .select('name')
    .eq('id', orderRow.waiter_id)
    .maybeSingle(); // Changed from .single() to .maybeSingle()

  if (waiterError) {
    logWithTimestamp('Error fetching waiter info', { 
      error: waiterError, 
      waiterId: orderRow.waiter_id,
      orderId: orderRow.id 
    });
    // Don't throw here, just log and continue with fallback
  }

  // Map order items to the expected format
  const items = orderItems?.map(item => ({
    name: item.item_name,
    quantity: item.quantity,
    price: Number(item.price)
  })) || [];

  return {
    id: orderRow.id,
    displayId, // Sequential display ID
    tableNumber: orderRow.table_number,
    status: orderRow.status as Order['status'],
    notes: orderRow.notes || '',
    items,
    basePrice: Number(orderRow.base_price),
    serviceFeePrice: Number(orderRow.service_fee_price),
    createdBy: waiter?.name || 'Unknown Waiter', // Gracefully handle missing waiter
    timestamp: orderRow.created_at || new Date().toISOString()
  };
};

export class SupabaseService {
  // Authentication methods
  async signUp(email: string, password: string, name: string, role: 'admin' | 'waiter' = 'waiter') {
    try {
      logWithTimestamp('Starting sign up process', { email, role });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        logWithTimestamp('Sign up error', error);
        throw error;
      }

      if (data.user) {
        logWithTimestamp('User signed up successfully', data.user.id);
        
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name,
            role
          });

        if (profileError) {
          logWithTimestamp('Profile creation error', profileError);
          throw profileError;
        }

        logWithTimestamp('User profile created successfully');
      }

      return { data, error: null };
    } catch (error) {
      logWithTimestamp('Sign up failed', error);
      return { data: null, error: error as AuthError };
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    try {
      logWithTimestamp('Starting sign in process', { email });

      // Test connection before attempting sign in
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (testError) {
        logWithTimestamp('Connection test failed before sign in', testError);
        throw new Error('Unable to connect to the database. Please check your internet connection and try again.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logWithTimestamp('Sign in error', error);
        return false;
      }

      if (data.user) {
        logWithTimestamp('User signed in successfully', data.user.id);
        
        // Fetch user profile to ensure it exists
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          logWithTimestamp('Profile fetch error or missing profile', profileError);
          // Try to create profile if it doesn't exist
          if (profileError?.code === 'PGRST116') {
            logWithTimestamp('Profile not found, creating default profile');
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                name: data.user.email?.split('@')[0] || 'User',
                role: 'waiter'
              });
            
            if (createError) {
              logWithTimestamp('Failed to create default profile', createError);
              return false;
            }
          } else {
            return false;
          }
        }

        logWithTimestamp('User profile verified successfully');
        return true;
      }

      return false;
    } catch (error) {
      logWithTimestamp('Sign in failed', error);
      return false;
    }
  }

  async signOut(): Promise<boolean> {
    try {
      logWithTimestamp('Starting sign out process');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logWithTimestamp('Sign out error', error);
        return false;
      }

      logWithTimestamp('User signed out successfully');
      return true;
    } catch (error) {
      logWithTimestamp('Sign out failed', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        logWithTimestamp('Get current user error', error);
        
        // Handle invalid refresh token by clearing the session
        if (error.message && error.message.includes('Refresh Token Not Found')) {
          logWithTimestamp('Invalid refresh token detected, clearing session');
          await supabase.auth.signOut();
        }
        
        return null;
      }

      if (!user) {
        logWithTimestamp('No current user found');
        return null;
      }

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        logWithTimestamp('Error fetching user profile', profileError);
        return null;
      }

      // Map to frontend User type
      const frontendUser: User = {
        id: user.id,
        email: user.email || '',
        name: profile.name,
        role: profile.role as 'admin' | 'waiter',
        createdAt: profile.created_at
      };

      logWithTimestamp('Current user retrieved and mapped', frontendUser.name);
      return frontendUser;
    } catch (error) {
      logWithTimestamp('Failed to get current user', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserRow | null> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          logWithTimestamp('Get user profile error', error);
          throw error;
        }

        logWithTimestamp('User profile retrieved', data);
        return data;
      }, 3, 1000, 'getUserProfile');
    } catch (error) {
      logWithTimestamp('Failed to get user profile after retries', error);
      return null;
    }
  }

  // Menu methods
  async getMenuItems(): Promise<MenuItemRow[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          logWithTimestamp('Get menu items error', error);
          throw error;
        }

        logWithTimestamp('Menu items retrieved', { count: data?.length || 0 });
        return data || [];
      }, 3, 1000, 'getMenuItems');
    } catch (error) {
      logWithTimestamp('Failed to get menu items after retries', error);
      return [];
    }
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          logWithTimestamp('Get all menu items error', error);
          throw error;
        }

        logWithTimestamp('All menu items retrieved', { count: data?.length || 0 });
        
        // Map to MenuItem type
        const menuItems: MenuItem[] = data?.map(item => ({
          id: item.id,
          name: item.name,
          grams: item.grams || undefined,
          price: Number(item.price),
          category: item.category,
          is_available: item.is_available ?? true,
          created_at: item.created_at,
          updated_at: item.updated_at
        })) || [];

        return menuItems;
      }, 3, 1000, 'getAllMenuItems');
    } catch (error) {
      logWithTimestamp('Failed to get all menu items after retries', error);
      return [];
    }
  }

  async createMenuItem(item: Omit<MenuItemRow, 'id' | 'created_at' | 'updated_at'>) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('menu_items')
          .insert(item)
          .select()
          .single();

        if (error) {
          logWithTimestamp('Create menu item error', error);
          throw error;
        }

        logWithTimestamp('Menu item created', data);
        return { data, error: null };
      }, 3, 1000, 'createMenuItem');
    } catch (error) {
      logWithTimestamp('Failed to create menu item after retries', error);
      return { data: null, error };
    }
  }

  async updateMenuItem(id: string, updates: Partial<Omit<MenuItemRow, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('menu_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          logWithTimestamp('Update menu item error', error);
          throw error;
        }

        logWithTimestamp('Menu item updated', data);
        return { data, error: null };
      }, 3, 1000, 'updateMenuItem');
    } catch (error) {
      logWithTimestamp('Failed to update menu item after retries', error);
      return { data: null, error };
    }
  }

  async deleteMenuItem(id: string) {
    try {
      return await withRetry(async () => {
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);

        if (error) {
          logWithTimestamp('Delete menu item error', error);
          throw error;
        }

        logWithTimestamp('Menu item deleted', id);
        return { error: null };
      }, 3, 1000, 'deleteMenuItem');
    } catch (error) {
      logWithTimestamp('Failed to delete menu item after retries', error);
      return { error };
    }
  }

  // Real-time subscription for menu items
  subscribeToMenuItems(callback: (menuItems: MenuItem[]) => void) {
    logWithTimestamp('Setting up menu items subscription');
    
    const channel = supabase
      .channel('menu_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items'
        },
        async (payload) => {
          logWithTimestamp('Menu items change detected', payload);
          try {
            // Re-fetch all menu items to ensure consistency
            const updatedItems = await this.getAllMenuItems();
            callback(updatedItems);
          } catch (error) {
            logWithTimestamp('Error re-fetching menu items after change', error);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      logWithTimestamp('Unsubscribing from menu items changes');
      supabase.removeChannel(channel);
    };
  }

  // NEW METHOD: Get occupied tables globally for all users
  async getOccupiedTables(): Promise<Set<string>> {
    try {
      return await withRetry(async () => {
        logWithTimestamp('Fetching occupied tables globally');
        
        // Query all active orders to check table occupancy
        // This uses the new RLS policy that allows reading for occupancy checking
        const { data, error } = await supabase
          .from('orders')
          .select('table_number')
          .eq('status', 'in-progress')
          .order('created_at', { ascending: false });

        if (error) {
          logWithTimestamp('Error fetching occupied tables', error);
          throw error;
        }

        // Extract unique table numbers
        const occupiedTables = new Set(data?.map(order => order.table_number) || []);
        
        logWithTimestamp('Occupied tables retrieved', { 
          count: occupiedTables.size, 
          tables: Array.from(occupiedTables) 
        });
        
        return occupiedTables;
      }, 3, 1000, 'getOccupiedTables');
    } catch (error) {
      logWithTimestamp('Failed to get occupied tables after retries', error);
      // Return empty set as fallback
      return new Set<string>();
    }
  }

  // Order methods with persistent ID management
  async getOrders(): Promise<Order[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false }); // Newest first

        if (error) {
          logWithTimestamp('Get orders error', error);
          throw error;
        }

        logWithTimestamp('Orders retrieved', { count: data?.length || 0 });
        
        // Map each order to the full Order type with display IDs
        const orders: Order[] = [];
        for (let i = 0; i < (data || []).length; i++) {
          const orderRow = data![i];
          try {
            // Calculate display ID based on reverse chronological position
            const displayId = (data?.length || 0) - i;
            const order = await mapOrderRowToOrder(orderRow, displayId);
            orders.push(order);
          } catch (error) {
            logWithTimestamp('Error mapping order', { orderId: orderRow.id, error });
            // Skip this order if mapping fails
          }
        }

        // Initialize order ID manager if needed
        if (orders.length > 0) {
          const maxDisplayId = Math.max(...orders.map(o => o.displayId));
          const currentNext = orderIdManager.peekNextOrderId();
          if (currentNext <= maxDisplayId) {
            orderIdManager.setNextOrderId(maxDisplayId + 1);
          }
        }

        return orders;
      }, 3, 1000, 'getOrders');
    } catch (error) {
      logWithTimestamp('Failed to get orders after retries', error);
      return [];
    }
  }

  // NEW METHOD: Get a single order by ID with graceful error handling
  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await withRetry(async () => {
        logWithTimestamp('Fetching order by ID', { id });
        
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle(); // Use maybeSingle() to handle missing records gracefully

        if (error) {
          logWithTimestamp('Get order by ID error', error);
          throw error;
        }

        if (!data) {
          logWithTimestamp('Order not found', { id });
          return null;
        }

        logWithTimestamp('Order retrieved by ID', data);
        
        // Calculate display ID (we'll use 1 for individual fetches)
        const displayId = 1;
        const order = await mapOrderRowToOrder(data, displayId);

        return order;
      }, 3, 1000, 'getOrderById');
    } catch (error) {
      logWithTimestamp('Failed to get order by ID after retries', error);
      return null;
    }
  }

  async createOrder(orderData: {
    tableNumber: string;
    items: Order['items'];
    status: Order['status'];
    notes?: string;
    basePrice: number;
    serviceFeePrice: number;
    waiterId: string;
  }) {
    try {
      return await withRetry(async () => {
        // Get the next sequential display ID
        const displayId = orderIdManager.getNextOrderId();
        
        // First, create the order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            table_number: orderData.tableNumber,
            status: orderData.status,
            notes: orderData.notes || null,
            base_price: orderData.basePrice,
            service_fee_price: orderData.serviceFeePrice,
            waiter_id: orderData.waiterId
          })
          .select()
          .single();

        if (orderError) {
          logWithTimestamp('Create order error', orderError);
          throw orderError;
        }

        // Then, create the order items
        if (orderData.items && orderData.items.length > 0) {
          const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            item_name: item.name,
            quantity: item.quantity,
            price: item.price
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            logWithTimestamp('Create order items error', itemsError);
            // Try to clean up the order if items creation failed
            await supabase.from('orders').delete().eq('id', order.id);
            throw itemsError;
          }
        }

        logWithTimestamp('Order created with items', { orderId: order.id, displayId });
        return { data: order, error: null };
      }, 3, 1000, 'createOrder');
    } catch (error) {
      logWithTimestamp('Failed to create order after retries', error);
      return { data: null, error };
    }
  }

  async updateOrder(id: string, updates: Partial<{
    tableNumber: string;
    status: Order['status'];
    notes: string;
    items: Order['items'];
    basePrice: number;
    serviceFeePrice: number;
  }>) {
    try {
      return await withRetry(async () => {
        // Add detailed logging for debugging
        logWithTimestamp('Attempting to update order', { 
          orderId: id, 
          updates: updates,
          updateKeys: Object.keys(updates)
        });

        // First, verify the order exists
        const { data: existingOrder, error: checkError } = await supabase
          .from('orders')
          .select('id, table_number, status')
          .eq('id', id)
          .maybeSingle();

        if (checkError) {
          logWithTimestamp('Error checking if order exists', { orderId: id, error: checkError });
          throw checkError;
        }

        if (!existingOrder) {
          logWithTimestamp('Order not found during update attempt', { orderId: id });
          return { 
            data: null, 
            error: { 
              message: 'Order not found',
              code: 'ORDER_NOT_FOUND',
              details: `Order with ID ${id} does not exist in the database`
            }
          };
        }

        logWithTimestamp('Order found, proceeding with update', { 
          orderId: id, 
          currentStatus: existingOrder.status,
          currentTable: existingOrder.table_number
        });

        // Update the main order
        const orderUpdates: Partial<OrderRow> = {};
        if (updates.tableNumber !== undefined) orderUpdates.table_number = updates.tableNumber;
        if (updates.status !== undefined) orderUpdates.status = updates.status;
        if (updates.notes !== undefined) orderUpdates.notes = updates.notes;
        if (updates.basePrice !== undefined) orderUpdates.base_price = updates.basePrice;
        if (updates.serviceFeePrice !== undefined) orderUpdates.service_fee_price = updates.serviceFeePrice;

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .update(orderUpdates)
          .eq('id', id)
          .select()
          .maybeSingle(); // Use maybeSingle() to handle missing records gracefully

        if (orderError) {
          logWithTimestamp('Update order error', orderError);
          throw orderError;
        }

        if (!order) {
          logWithTimestamp('Order disappeared during update', { id });
          return { 
            data: null, 
            error: { 
              message: 'Order not found',
              code: 'ORDER_NOT_FOUND',
              details: `Order with ID ${id} was not found during update`
            }
          };
        }

        // If items are being updated, replace all order items
        if (updates.items !== undefined) {
          logWithTimestamp('Updating order items', { orderId: id, itemCount: updates.items.length });
          
          // Delete existing items
          const { error: deleteError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', id);

          if (deleteError) {
            logWithTimestamp('Delete existing order items error', deleteError);
            throw deleteError;
          }

          // Insert new items
          if (updates.items.length > 0) {
            const orderItems = updates.items.map(item => ({
              order_id: id,
              item_name: item.name,
              quantity: item.quantity,
              price: item.price
            }));

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(orderItems);

            if (itemsError) {
              logWithTimestamp('Create new order items error', itemsError);
              throw itemsError;
            }
          }
        }

        logWithTimestamp('Order updated successfully', { 
          orderId: order.id, 
          newStatus: order.status,
          newTable: order.table_number
        });
        return { data: order, error: null };
      }, 3, 1000, 'updateOrder');
    } catch (error) {
      logWithTimestamp('Failed to update order after retries', { orderId: id, error });
      return { data: null, error };
    }
  }

  async deleteOrder(id: string) {
    try {
      return await withRetry(async () => {
        // First check if order exists
        const { data: existingOrder, error: checkError } = await supabase
          .from('orders')
          .select('id')
          .eq('id', id)
          .maybeSingle();

        if (checkError) {
          logWithTimestamp('Error checking if order exists before delete', { orderId: id, error: checkError });
          throw checkError;
        }

        if (!existingOrder) {
          logWithTimestamp('Order not found during delete attempt', { orderId: id });
          return { 
            error: { 
              message: 'Order not found',
              code: 'ORDER_NOT_FOUND',
              details: `Order with ID ${id} does not exist in the database`
            }
          };
        }

        // First delete order items (foreign key constraint)
        const { error: itemsError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);

        if (itemsError) {
          logWithTimestamp('Delete order items error', itemsError);
          throw itemsError;
        }

        // Then delete the order
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', id);

        if (error) {
          logWithTimestamp('Delete order error', error);
          throw error;
        }

        logWithTimestamp('Order deleted', id);
        // Note: We don't decrement the order ID counter when deleting
        // This maintains persistent sequential IDs
        return { error: null };
      }, 3, 1000, 'deleteOrder');
    } catch (error) {
      logWithTimestamp('Failed to delete order after retries', error);
      return { error };
    }
  }

  // Real-time subscription for orders
  subscribeToOrders(callback: (orders: Order[]) => void) {
    logWithTimestamp('Setting up orders subscription');
    
    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          logWithTimestamp('Orders change detected', payload);
          try {
            // Re-fetch all orders to ensure consistency
            const updatedOrders = await this.getOrders();
            callback(updatedOrders);
          } catch (error) {
            logWithTimestamp('Error re-fetching orders after change', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        async (payload) => {
          logWithTimestamp('Order items change detected', payload);
          try {
            // Re-fetch all orders to ensure consistency
            const updatedOrders = await this.getOrders();
            callback(updatedOrders);
          } catch (error) {
            logWithTimestamp('Error re-fetching orders after order items change', error);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      logWithTimestamp('Unsubscribing from orders changes');
      supabase.removeChannel(channel);
    };
  }

  // Real-time subscription for table occupancy (for new order page)
  subscribeToTableOccupancy(callback: (occupiedTables: Set<string>) => void) {
    logWithTimestamp('Setting up table occupancy subscription');
    
    const channel = supabase
      .channel('table_occupancy_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          logWithTimestamp('Table occupancy change detected', payload);
          try {
            // Re-fetch occupied tables
            const updatedOccupiedTables = await this.getOccupiedTables();
            callback(updatedOccupiedTables);
          } catch (error) {
            logWithTimestamp('Error re-fetching table occupancy after change', error);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      logWithTimestamp('Unsubscribing from table occupancy changes');
      supabase.removeChannel(channel);
    };
  }
}

// Export an instance of the service for named import compatibility
export const supabaseService = new SupabaseService();