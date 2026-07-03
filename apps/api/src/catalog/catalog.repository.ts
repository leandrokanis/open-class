import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, countDistinct, desc, eq, ilike, inArray, isNull, lt, or, sql, sum } from 'drizzle-orm';
import { categories, courses, modules, lessons, users, lessonCohorts } from '@open-class/db';
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
    rating: number | null;
    reviewCount: number;
    lessonCount: number;
    totalDurationMinutes: number;
    createdAt: Date;
    category: { id: string; name: string; slug: string } | null;
    instructor: { name: string; avatarUrl: string | null };
  }>;
  hasMore: boolean;
}

export interface CatalogStats {
  totalCourses: number;
  totalInstructors: number;
  percentFree: number;
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

    const lessonStats = this.db
      .select({
        courseId: courses.id,
        lessonCount: count(lessons.id).as('lesson_count'),
        totalDurationSeconds: sum(lessons.duration).as('total_duration_seconds'),
      })
      .from(courses)
      .innerJoin(modules, eq(modules.courseId, courses.id))
      .innerJoin(lessons, and(
        eq(lessons.moduleId, modules.id),
        eq(lessons.visibility, 'visible'),
        // Extras ficam fora da contagem e do tempo total estimado (US-20)
        eq(lessons.isExtra, false),
        // Exclusivas de turma também não entram nos agregados públicos (US-25)
        sql`NOT EXISTS (SELECT 1 FROM lesson_cohorts lc WHERE lc.lesson_id = ${lessons.id})`,
      ))
      .where(and(eq(modules.visibility, 'visible'), isNull(courses.deletedAt)))
      .groupBy(courses.id)
      .as('lesson_stats');

    const rows = await this.db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        shortDescription: courses.shortDescription,
        level: courses.level,
        thumbnailUrl: courses.thumbnailUrl,
        rating: courses.rating,
        reviewCount: courses.reviewCount,
        createdAt: courses.createdAt,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        instructorName: users.name,
        instructorAvatarUrl: users.avatarUrl,
        lessonCount: lessonStats.lessonCount,
        totalDurationSeconds: lessonStats.totalDurationSeconds,
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .innerJoin(users, eq(courses.instructorId, users.id))
      .leftJoin(lessonStats, eq(lessonStats.courseId, courses.id))
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
        rating: r.rating !== null ? Number(r.rating) : null,
        reviewCount: r.reviewCount ?? 0,
        lessonCount: Number(r.lessonCount ?? 0),
        totalDurationMinutes: Math.round(Number(r.totalDurationSeconds ?? 0) / 60),
        createdAt: r.createdAt,
        category: r.categoryId
          ? { id: r.categoryId, name: r.categoryName!, slug: r.categorySlug! }
          : null,
        instructor: { name: r.instructorName, avatarUrl: r.instructorAvatarUrl ?? null },
      })),
      hasMore,
    };
  }

  async findBySlug(slug: string, allowDraft = false) {
    const conditions = [eq(courses.slug, slug), isNull(courses.deletedAt)];
    if (!allowDraft) conditions.push(eq(courses.status, 'published'));
    const row = await this.db.query.courses.findFirst({
      where: and(...conditions),
      with: {
        instructor: { columns: { id: true, name: true, avatarUrl: true } },
        category: { columns: { id: true, name: true, slug: true } },
        modules: {
          where: eq(modules.visibility, 'visible'),
          orderBy: [asc(modules.position)],
          with: {
            lessons: {
              where: eq(lessons.visibility, 'visible'),
              // Normais primeiro, extras depois; posição é por grupo (US-20/21)
              orderBy: [asc(lessons.isExtra), asc(lessons.position)],
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

  /** cohortIds por aula (exclusividade many-to-many — US-25), em lote. */
  async findLessonCohortIds(lessonIds: string[]): Promise<Record<string, string[]>> {
    if (lessonIds.length === 0) return {};
    const rows = await this.db
      .select({ lessonId: lessonCohorts.lessonId, cohortId: lessonCohorts.cohortId })
      .from(lessonCohorts)
      .where(inArray(lessonCohorts.lessonId, lessonIds));
    const map: Record<string, string[]> = {};
    for (const r of rows) (map[r.lessonId] ??= []).push(r.cohortId);
    return map;
  }

  /** Turma do aluno neste curso (para exibição de aulas exclusivas — US-25). */
  async findStudentCohortForCourse(studentId: string, courseId: string) {
    const rows = await this.db.execute(sql`
      SELECT c.id AS "cohortId", (c.closed_at IS NOT NULL) AS "closed"
      FROM cohort_enrollments ce
      JOIN cohorts c ON c.id = ce.cohort_id
      WHERE ce.student_id = ${studentId} AND c.course_id = ${courseId}
      LIMIT 1
    `);
    const first = (rows as unknown as { rows?: Array<{ cohortId: string; closed: boolean }> }).rows?.[0]
      ?? (rows as unknown as Array<{ cohortId: string; closed: boolean }>)[0];
    if (!first) return null;
    return { cohortId: first.cohortId, closed: Boolean(first.closed) };
  }

  async getStats(): Promise<CatalogStats> {
    const [result] = await this.db
      .select({
        totalCourses: count(courses.id),
        totalInstructors: countDistinct(courses.instructorId),
      })
      .from(courses)
      .where(and(eq(courses.status, 'published'), isNull(courses.deletedAt)));

    return {
      totalCourses: result?.totalCourses ?? 0,
      totalInstructors: result?.totalInstructors ?? 0,
      percentFree: 100,
    };
  }
}
