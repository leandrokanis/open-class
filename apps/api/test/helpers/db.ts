import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@open-class/db';
import { users, passwordResetTokens } from '@open-class/db';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://openclass:openclass@localhost:5432/openclass_test',
});

export const testDb = drizzle(pool, { schema });

export async function cleanDb() {
  await testDb.delete(passwordResetTokens);
  await testDb.delete(users);
}

export async function closeDb() {
  await pool.end();
}
