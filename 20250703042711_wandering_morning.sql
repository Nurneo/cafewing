/*
  # Update order statuses to use only three statuses

  1. Changes
    - Remove 'pending' status from orders table
    - Update existing 'pending' orders to 'in-progress'
    - Update check constraint to only allow three statuses

  2. Security
    - Maintains existing RLS policies
    - No changes to permissions
*/

-- Update existing pending orders to in-progress
UPDATE orders 
SET status = 'in-progress' 
WHERE status = 'pending';

-- Drop the existing check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new check constraint with only three statuses
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['in-progress'::text, 'completed'::text, 'updated'::text]));