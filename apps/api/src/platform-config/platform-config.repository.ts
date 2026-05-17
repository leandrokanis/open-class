import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { platformConfig, type PlatformConfig } from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class PlatformConfigRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  findAll(): Promise<PlatformConfig[]> {
    return this.db.select().from(platformConfig);
  }

  async upsert(key: string, value: string): Promise<void> {
    await this.db
      .insert(platformConfig)
      .values({ key, value })
      .onConflictDoUpdate({
        target: platformConfig.key,
        set: { value, updatedAt: sql`now()` },
      });
  }
}
