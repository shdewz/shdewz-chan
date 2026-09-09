import fs from 'fs';
import path from 'path';
import pool from '@/db';

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Aborting migrations.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        run_on TIMESTAMPTZ DEFAULT now()
      )
    `);

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('No migrations directory found at', MIGRATIONS_DIR);
      return;
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      const applied = await client.query(
        'SELECT 1 FROM migrations WHERE name = $1 LIMIT 1',
        [file],
      );
      if (applied.rowCount !== null && applied.rowCount > 0) {
        console.log('Skipping already-applied migration', file);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      console.log('Applying migration', file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log('Applied', file);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to apply migration', file, err);
        throw err;
      }
    }
  } finally {
    client.release();
    try {
      await pool.end();
    } catch {
      // ignore
    }
  }
};

if (import.meta.main) {
  run().catch((err) => {
    console.error('Migration runner failed', err);
    process.exit(1);
  });
}

export default run;
