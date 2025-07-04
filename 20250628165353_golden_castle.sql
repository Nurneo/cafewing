/*
  # Create orders table for Themis application

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `table_number` (text)
      - `status` (text, enum: pending, in-progress, completed, updated)
      - `notes` (text, optional)
      - `base_price` (numeric)
      - `service_fee_price` (numeric)
      - `waiter_id` (uuid, foreign key to users.id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for waiters to manage their own orders
    - Add policy for admins to manage all orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'updated')),
  notes text,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  service_fee_price numeric(10,2) NOT NULL DEFAULT 0,
  waiter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for waiters to manage their own orders
CREATE POLICY "Waiters can manage own orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (waiter_id = auth.uid());

-- Policy for admins to manage all orders
CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);