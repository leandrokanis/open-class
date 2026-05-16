import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { modules, lessons, type NewModule } from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class ModulesRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  findByCourse(courseId: string) {
    return this.db.query.modules.findMany({
      where: eq(modules.courseId, courseId),
      orderBy: modules.position,
    });
  }

  findById(id: string) {
    return this.db.query.modules.findFirst({ where: eq(modules.id, id) });
  }

  async insert(data: NewModule) {
    const [module] = await this.db.insert(modules).values(data).returning();
    return module;
  }

  async update(id: string, data: Partial<Omit<NewModule, 'id' | 'courseId' | 'createdAt'>>) {
    const [module] = await this.db
      .update(modules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modules.id, id))
      .returning();
    return module;
  }

  async delete(id: string) {
    await this.db.delete(modules).where(eq(modules.id, id));
  }

  async nextPosition(courseId: string): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`coalesce(max(${modules.position}), 0)` })
      .from(modules)
      .where(eq(modules.courseId, courseId));
    return (result[0]?.max ?? 0) + 1;
  }

  async updatePosition(id: string, position: number) {
    await this.db.update(modules).set({ position }).where(eq(modules.id, id));
  }

  async findAllIdsByCourse(courseId: string): Promise<string[]> {
    const rows = await this.db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.position);
    return rows.map((r) => r.id);
  }

  async courseSummary(courseId: string) {
    const rows = await this.db
      .select({
        moduleId:            modules.id,
        lessonsCount:        sql<number>`count(${lessons.id})::int`,
        totalDurationSeconds: sql<number>`coalesce(sum(${lessons.durationSeconds}), 0)::int`,
      })
      .from(modules)
      .leftJoin(lessons, eq(lessons.moduleId, modules.id))
      .where(eq(modules.courseId, courseId))
      .groupBy(modules.id);
    return rows;
  }
}
