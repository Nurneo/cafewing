/*
  # Add default users for development bypass mode

  1. New Users
    - Administrator (admin role)
    - Player 1 (waiter role) 
    - Player 2 (waiter role)

  2. Purpose
    - These users match the hardcoded IDs in AuthContext.tsx for bypass mode
    - Prevents foreign key constraint violations when creating orders
    - Enables development and testing without authentication setup

  3. Security
    - These are development-only users for bypass mode
    - Should be removed or secured in production
*/

-- Insert default users for development bypass mode
INSERT INTO users (id, name, role, created_at, updated_at) VALUES
  (
    '05db03d2-6d8a-40ae-99b4-f1785966ebb9',
    'Administrator', 
    'admin',
    now(),
    now()
  ),
  (
    '83e04aaf-d6a8-45ec-ad2e-3d637f42a793',
    'Player 1',
    'waiter', 
    now(),
    now()
  ),
  (
    '59a949c0-3818-46cb-acdf-0381cf94d3b3',
    'Player 2',
    'waiter',
    now(), 
    now()
  )
ON CONFLICT (id) DO NOTHING;