-- Create users table for storing per-user settings
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  osu_user_id INTEGER,
  osu_username TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
