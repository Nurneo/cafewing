/*
  # Fix RLS Policies for Restaurant Management System

  1. Security Changes
    - Drop all existing RLS policies on all tables
    - Create new, properly configured RLS policies
    - Allow authenticated users to read basic user info (names, roles)
    - Maintain proper access control for orders and menu items

  2. New Policies
    - Users: Allow reading basic info, users can update own profile
    - Orders: Admins can manage all, waiters can manage own orders
    - Menu Items: Admins can manage, all authenticated users can read
    - Order Items: Follow same pattern as orders
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Waiters can manage own orders" ON orders;

DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "All users can read menu items" ON menu_items;

DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
DROP POLICY IF EXISTS "Waiters can manage own order items" ON order_items;

-- Create new policies for users table
CREATE POLICY "Allow authenticated users to read basic user info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create new policies for orders table
CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Waiters can manage own orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (waiter_id = auth.uid())
  WITH CHECK (waiter_id = auth.uid());

-- Create new policies for menu_items table
CREATE POLICY "Admins can manage menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can read menu items"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Create new policies for order_items table
CREATE POLICY "Admins can manage all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Waiters can manage own order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.waiter_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.waiter_id = auth.uid()
    )
  );