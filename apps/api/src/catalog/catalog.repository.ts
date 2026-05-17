import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, ilike, isNull, lt, or, sql } from 'drizzle-orm';
import { categories, courses, modules, lessons, users } from '@open-class/db';
import type { Db } from '../db';

interface FindPublishedOpts {
  categoryId?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  q?: string;
  cursor?: { createdAt: Date; id: string };
  limit: number;
}

interface FindPublishedResult {
  rows: Array<{
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    level: string | null;
    thumbnailUrl: string | null;
    createdAt: Date;
    category: { id: string; name: string; slug: string } | null;
    instructor: { name: string };
  }>;
  hasMore: boolean;
}

@Injectable()
export class CatalogRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  async findPublished(opts: FindPublishedOpts): Promise<FindPublishedResult> {
    const { categoryId, level, q, cursor, limit } = opts;

    const trimmedQ = q?.trim();

    const conditions = [
      eq(courses.status, 'published'),
      isNull(courses.deletedAt),
      ...(categoryId ? [eq(courses.categoryId, categoryId)] : []),
      ...(level ? [eq(courses.level, level)] : []),
      ...(trimmedQ
        ? [
            or(
              ilike(courses.title, `%${trimmedQ}%`),
              ilike(courses.shortDescription, `%${trimmedQ}%`),
            ),
          ]
        : []),
      ...(cursor
        ? [
            or(
              lt(courses.createdAt, cursor.createdAt),
              and(
                sql`${courses.createdAt} = ${cursor.createdAt}`,
                lt(courses.id, cursor.id),
              ),
            ),
          ]
        : []),
    ];

    const rows = await this.db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        shortDescription: courses.shortDescription,
        level: courses.level,
        thumbnailUrl: courses.thumbnailUrl,
        createdAt: courses.createdAt,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        instructorName: users.name,
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .innerJoin(users, eq(courses.instructorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(courses.createdAt), desc(courses.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    return {
      rows: pageRows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        shortDescription: r.shortDescription ?? null,
        level: r.level ?? null,
        thumbnailUrl: r.thumbnailUrl ?? null,
        createdAt: r.createdAt,
        category: r.categoryId
          ? { id: r.categoryId, name: r.categoryName!, slug: r.categorySlug! }
          : null,
        instructor: { name: r.instructorName },
      })),
      hasMore,
    };
  }

  async findBySlug(slug: string) {
    const row = await this.db.query.courses.findFirst({
      where: and(
        eq(courses.slug, slug),
        eq(courses.status, 'published'),
        isNull(courses.deletedAt),
      ),
      with: {
        instructor: { columns: { name: true } },
        category: { columns: { id: true, name: true, slug: true } },
        modules: {
          where: eq(modules.visibility, 'visible'),
          orderBy: [asc(modules.position)],
          with: {
            lessons: {
              where: eq(lessons.visibility, 'visible'),
              orderBy: [asc(lessons.position)],
            },
          },
        },
      },
    });
    return row ?? null;
  }

  async findCategories() {
    return this.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        iconUrl: categories.iconUrl,
      })
      .from(categories)
      .orderBy(asc(categories.position));
  }
}
