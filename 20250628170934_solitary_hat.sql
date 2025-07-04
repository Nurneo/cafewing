/*
  # Add Demo Users

  1. Demo Users
    - Creates demo user accounts for testing and demonstration
    - Includes both waiter and admin roles
    - Users: player1@themis.cafe (waiter), player2@themis.cafe (waiter), admin@themis.cafe (admin)
  
  2. Security
    - Users are inserted into the users table with appropriate roles
    - Passwords will be set through Supabase Auth separately
  
  Note: This migration only creates the user records in the users table.
  The actual authentication accounts need to be created through Supabase Auth dashboard or API.
*/

-- Insert demo users into the users table
-- Note: These correspond to the demo credentials shown in the login form

INSERT INTO users (id, name, role, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Player 1', 'waiter', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'Player 2', 'waiter', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Administrator', 'admin', now(), now())
ON CONFLICT (id) DO NOTHING;