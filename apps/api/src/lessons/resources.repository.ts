import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { lessonResources, type NewLessonResource } from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class ResourcesRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  findByLesson(lessonId: string) {
    return this.db.query.lessonResources.findMany({
      where: eq(lessonResources.lessonId, lessonId),
      orderBy: lessonResources.position,
    });
  }

  findById(id: string) {
    return this.db.query.lessonResources.findFirst({
      where: eq(lessonResources.id, id),
    });
  }

  async insert(data: NewLessonResource) {
    const [resource] = await this.db.insert(lessonResources).values(data).returning();
    return resource;
  }

  async update(id: string, data: Partial<Pick<NewLessonResource, 'title' | 'url'>>) {
    const [resource] = await this.db
      .update(lessonResources)
      .set(data)
      .where(eq(lessonResources.id, id))
      .returning();
    return resource;
  }

  async delete(id: string) {
    await this.db.delete(lessonResources).where(eq(lessonResources.id, id));
  }

  async nextPosition(lessonId: string): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`coalesce(max(${lessonResources.position}), 0)` })
      .from(lessonResources)
      .where(eq(lessonResources.lessonId, lessonId));
    return (result[0]?.max ?? 0) + 1;
  }
}
