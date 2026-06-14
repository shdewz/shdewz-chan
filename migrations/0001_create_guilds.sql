-- Create guilds table for storing per-guild settings
CREATE TABLE IF NOT EXISTS guilds (
  guild_id TEXT PRIMARY KEY,
  prefix TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
