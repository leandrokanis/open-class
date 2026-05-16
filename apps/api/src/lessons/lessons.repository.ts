import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
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
}
