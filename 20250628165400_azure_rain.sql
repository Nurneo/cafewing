/*
  # Create order_items table for Themis application

  1. New Tables
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders.id)
      - `item_name` (text)
      - `quantity` (integer)
      - `price` (numeric)

  2. Security
    - Enable RLS on `order_items` table
    - Add policy for waiters to manage items of their own orders
    - Add policy for admins to manage all order items
*/

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy for waiters to manage items of their own orders
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
  );

-- Policy for admins to manage all order items
CREATE POLICY "Admins can manage all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);