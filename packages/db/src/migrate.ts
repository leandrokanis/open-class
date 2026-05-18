import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as path from 'path';
import * as fs from 'fs';

const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 30;

async function waitForDatabase(pool: Pool): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log(`[migrate] Connected to database on attempt ${attempt}`);
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(
        `[migrate] Attempt ${attempt}/${MAX_RETRIES} failed: ${message}. Retrying in ${RETRY_DELAY_MS}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  throw new Error(`Could not connect to database after ${MAX_RETRIES} attempts`);
}

function resolveMigrationsFolder(): string {
  const candidates = [
    path.resolve(__dirname, '../../drizzle'),
    path.resolve(__dirname, '../drizzle'),
    path.resolve(process.cwd(), 'packages/db/drizzle'),
    path.resolve(process.cwd(), 'drizzle'),
  ];

  for (const folder of candidates) {
    if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
      const sqlFiles = fs.readdirSync(folder).filter((f) => f.endsWith('.sql'));
      if (sqlFiles.length > 0) {
        console.log(`[migrate] Found ${sqlFiles.length} migrations in ${folder}`);
        return folder;
      }
    }
  }

  throw new Error(
    `No migrations folder with .sql files found. Tried:\n${candidates.map((c) => `  - ${c}`).join('\n')}`,
  );
}

export async function runMigrations(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const migrationsFolder = resolveMigrationsFolder();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    await waitForDatabase(pool);

    const db = drizzle(pool);
    console.log(`[migrate] Running migrations from ${migrationsFolder}...`);
    await migrate(db, { migrationsFolder });
    console.log('[migrate] Migrations applied successfully.');
  } finally {
    await pool.end();
  }
}

// Script entry point
if (require.main === module) {
  runMigrations().catch((err) => {
    console.error('[migrate] Migration failed:', err);
    process.exit(1);
  });
}
