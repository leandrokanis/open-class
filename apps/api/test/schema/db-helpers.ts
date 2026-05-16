import { Pool, type PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://openclass:openclass@localhost:5432/openclass',
  max: 5,
});

export async function query(sql: string, values?: unknown[]): Promise<import('pg').QueryResult> {
  return pool.query(sql, values);
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function closePool(): Promise<void> {
  await pool.end();
}

export function generateSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
