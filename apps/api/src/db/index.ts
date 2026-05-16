import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@open-class/db';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://openclass:openclass@localhost:5432/openclass',
});

export const db = drizzle(pool, { schema });
export type Db = typeof db;
