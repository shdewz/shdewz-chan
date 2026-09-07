import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

const pool = new Pool({ connectionString });

export const query = async (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

export const getGuildPrefixFromDb = async (
  guildId: string,
): Promise<string | null> => {
  const res = await pool.query(
    'SELECT prefix FROM guilds WHERE guild_id = $1 LIMIT 1',
    [guildId],
  );
  if (res.rows.length === 0) return null;
  return res.rows[0].prefix ?? null;
};

export const setGuildPrefixInDb = async (
  guildId: string,
  prefix: string,
): Promise<void> => {
  await pool.query(
    `
      INSERT INTO guilds (guild_id, prefix) VALUES ($1, $2)
      ON CONFLICT (guild_id) DO UPDATE SET prefix = EXCLUDED.prefix
    `,
    [guildId, prefix],
  );
};

export default pool;
