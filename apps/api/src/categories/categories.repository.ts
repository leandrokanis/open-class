import { Inject, Injectable } from '@nestjs/common';
import { eq, asc, count, sql } from 'drizzle-orm';
import { categories, courses, type NewCategory } from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class CategoriesRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const rows = await this.db.query.categories.findMany({
      orderBy: [asc(categories.position)],
      limit,
      offset,
    });
    const [{ value: total }] = await this.db.select({ value: count() }).from(categories);
    return { rows, total: Number(total) };
  }

  findById(id: string) {
    return this.db.query.categories.findFirst({ where: eq(categories.id, id) });
  }

  findByName(name: string) {
    return this.db.query.categories.findFirst({ where: eq(categories.name, name) });
  }

  findBySlug(slug: string) {
    return this.db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  }

  async slugExists(slug: string): Promise<boolean> {
    const row = await this.db.query.categories.findFirst({
      where: eq(categories.slug, slug),
      columns: { id: true },
    });
    return !!row;
  }

  async maxPosition(): Promise<number> {
    const [{ value }] = await this.db
      .select({ value: sql<number>`COALESCE(MAX(${categories.position}), -1)` })
      .from(categories);
    return Number(value);
  }

  async create(data: NewCategory) {
    const [row] = await this.db.insert(categories).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<NewCategory>) {
    const [row] = await this.db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return row;
  }

  async delete(id: string) {
    await this.db.delete(categories).where(eq(categories.id, id));
  }

  async countLinkedCourses(id: string): Promise<number> {
    const [{ value }] = await this.db
      .select({ value: count() })
      .from(courses)
      .where(eq(courses.categoryId, id));
    return Number(value);
  }

  async reorder(ids: string[]) {
    return this.db.transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(categories)
          .set({ position: i, updatedAt: new Date() })
          .where(eq(categories.id, ids[i]));
      }
      return tx.query.categories.findMany({ orderBy: [asc(categories.position)] });
    });
  }
}
