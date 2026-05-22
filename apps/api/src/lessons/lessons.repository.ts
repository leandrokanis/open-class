import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ne, sql } from 'drizzle-orm';
import { lessons, lessonResources, type NewLesson } from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class LessonsRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  findByModule(moduleId: string) {
    return this.db.query.lessons.findMany({
      where: eq(lessons.moduleId, moduleId),
      orderBy: lessons.position,
    });
  }

  findById(id: string) {
    return this.db.query.lessons.findFirst({ where: eq(lessons.id, id) });
  }

  findByIdWithResources(id: string) {
    return this.db.query.lessons.findFirst({
      where: eq(lessons.id, id),
      with: { resources: { orderBy: lessonResources.position } },
    });
  }

  async insert(data: NewLesson) {
    const [lesson] = await this.db.insert(lessons).values(data).returning();
    return lesson;
  }

  async update(id: string, data: Partial<Omit<NewLesson, 'id' | 'moduleId' | 'createdAt'>>) {
    const [lesson] = await this.db
      .update(lessons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return lesson;
  }

  async delete(id: string) {
    await this.db.delete(lessons).where(eq(lessons.id, id));
  }

  async nextPosition(moduleId: string): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`coalesce(max(${lessons.position}), 0)` })
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId));
    return (result[0]?.max ?? 0) + 1;
  }

  async updatePosition(id: string, position: number) {
    await this.db.update(lessons).set({ position }).where(eq(lessons.id, id));
  }

  async findAllIdsByModule(moduleId: string): Promise<string[]> {
    const rows = await this.db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId))
      .orderBy(lessons.position);
    return rows.map((r) => r.id);
  }

  async moveToModule(id: string, sourceModuleId: string, targetModuleId: string, position: number) {
    return this.db.transaction(async (tx) => {
      // 1. Move lesson to target module with a temporary high position to avoid constraint conflicts
      await tx
        .update(lessons)
        .set({ moduleId: targetModuleId, position: 999999, updatedAt: new Date() })
        .where(eq(lessons.id, id));

      // 2. Compact source module (excluding the moved lesson, now in target)
      const sourceRows = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.moduleId, sourceModuleId), ne(lessons.id, id)))
        .orderBy(lessons.position);
      await Promise.all(sourceRows.map((r, i) =>
        tx.update(lessons).set({ position: i + 1 }).where(eq(lessons.id, r.id)),
      ));

      // 3. Reorder target module: insert moved lesson at requested position
      const targetOthers = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.moduleId, targetModuleId), ne(lessons.id, id)))
        .orderBy(lessons.position);

      const newOrder = targetOthers.map((r) => r.id);
      newOrder.splice(Math.max(0, position - 1), 0, id);
      await Promise.all(newOrder.map((lid, i) =>
        tx.update(lessons).set({ position: i + 1 }).where(eq(lessons.id, lid)),
      ));

      // 4. Return updated lesson
      const [updated] = await tx
        .update(lessons)
        .set({ updatedAt: new Date() })
        .where(eq(lessons.id, id))
        .returning();
      return updated;
    });
  }
}
