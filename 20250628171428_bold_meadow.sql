-- Insert demo users into the users table with correct UUIDs
-- Note: These correspond to the actual user accounts created in Supabase Auth

INSERT INTO users (id, name, role, created_at, updated_at) VALUES
  ('83e04aaf-d6a8-45ec-ad2e-3d637f42a793', 'Player 1', 'waiter', now(), now()),
  ('59a949c0-3818-46cb-acdf-0381cf94d3b3', 'Player 2', 'waiter', now(), now()),
  ('05db03d2-6d8a-40ae-99b4-f1785966ebb9', 'Administrator', 'admin', now(), now())
ON CONFLICT (id) DO NOTHING;