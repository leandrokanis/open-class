import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as path from 'path';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  const db = drizzle(pool);

  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  console.log(`Running migrations from ${migrationsFolder}...`);

  await migrate(db, { migrationsFolder });

  console.log('Migrations applied.');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
