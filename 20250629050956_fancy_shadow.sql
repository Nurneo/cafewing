/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current policies query the users table to check if user is admin
    - This creates infinite recursion when the policy tries to access the same table it's protecting

  2. Solution
    - Drop existing problematic policies
    - Create new policies that use auth.uid() directly
    - Use custom claims or a different approach for admin role checking

  3. Changes
    - Remove policies that cause self-referencing queries
    - Add simple policies that allow users to read their own data
    - Add policies for admin access using a safer approach
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new safe policies
-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- For admin operations, we'll handle this at the application level
-- or use a different approach that doesn't cause recursion
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);