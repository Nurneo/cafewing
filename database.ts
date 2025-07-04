export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: 'waiter' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: 'waiter' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: 'waiter' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          table_number: string;
          status: 'pending' | 'in-progress' | 'completed' | 'updated';
          notes: string | null;
          base_price: number;
          service_fee_price: number;
          waiter_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          table_number: string;
          status?: 'pending' | 'in-progress' | 'completed' | 'updated';
          notes?: string | null;
          base_price: number;
          service_fee_price: number;
          waiter_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          table_number?: string;
          status?: 'pending' | 'in-progress' | 'completed' | 'updated';
          notes?: string | null;
          base_price?: number;
          service_fee_price?: number;
          waiter_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_name: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          item_name: string;
          quantity: number;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          item_name?: string;
          quantity?: number;
          price?: number;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          grams: string | null;
          price: number;
          category: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          grams?: string | null;
          price: number;
          category: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          grams?: string | null;
          price?: number;
          category?: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}