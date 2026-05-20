import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull, and, not, sql, count, asc, desc, avg } from 'drizzle-orm';
import { courses, modules, lessons, enrollments, type NewCourse } from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class CoursesRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  // ── Courses ──────────────────────────────────────────────────────────────

  findById(id: string) {
    return this.db.query.courses.findFirst({
      where: and(eq(courses.id, id), isNull(courses.deletedAt)),
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters: { status?: 'draft' | 'published'; instructorId?: string } = {},
  ) {
    const offset = (page - 1) * limit;
    const conditions = [isNull(courses.deletedAt)];
    if (filters.status) conditions.push(eq(courses.status, filters.status));
    if (filters.instructorId) conditions.push(eq(courses.instructorId, filters.instructorId));
    const where = and(...conditions);

    const rows = await this.db.query.courses.findMany({
      where,
      orderBy: [desc(courses.createdAt)],
      limit,
      offset,
    });
    const [{ value: total }] = await this.db
      .select({ value: count() })
      .from(courses)
      .where(where);
    return { rows, total: Number(total) };
  }

  async findByInstructorId(instructorId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const rows = await this.db.query.courses.findMany({
      where: and(eq(courses.instructorId, instructorId), isNull(courses.deletedAt)),
      orderBy: [asc(courses.createdAt)],
      limit,
      offset,
    });
    const [{ value: total }] = await this.db
      .select({ value: count() })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), isNull(courses.deletedAt)));
    return { rows, total: Number(total) };
  }

  async findWithModulesAndLessons(id: string) {
    return this.db.query.courses.findFirst({
      where: and(eq(courses.id, id), isNull(courses.deletedAt)),
      with: {
        modules: {
          orderBy: [asc(modules.position)],
          with: {
            lessons: { orderBy: [asc(lessons.position)] },
          },
        },
      },
    });
  }

  async create(data: NewCourse) {
    const [row] = await this.db.insert(courses).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<NewCourse>) {
    const [row] = await this.db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(courses.id, id), isNull(courses.deletedAt)))
      .returning();
    return row;
  }

  async softDelete(id: string) {
    await this.db
      .update(courses)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(courses.id, id));
  }

  async countVisibleLessons(courseId: string): Promise<number> {
    const [{ value }] = await this.db
      .select({ value: count() })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(
        and(
          eq(modules.courseId, courseId),
          eq(modules.visibility, 'visible'),
          eq(lessons.visibility, 'visible'),
        ),
      );
    return Number(value);
  }

  async getInstructorStats(instructorId: string) {
    const instructorCourses = this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), isNull(courses.deletedAt)))
      .as('instructor_courses');

    const [studentsRow] = await this.db
      .select({ value: sql<number>`COUNT(DISTINCT ${enrollments.studentId})` })
      .from(enrollments)
      .innerJoin(instructorCourses, eq(enrollments.courseId, instructorCourses.id));

    const [publishedRow] = await this.db
      .select({ value: count() })
      .from(courses)
      .where(
        and(
          eq(courses.instructorId, instructorId),
          eq(courses.status, 'published'),
          isNull(courses.deletedAt),
        ),
      );

    const [ratingRow] = await this.db
      .select({ value: avg(courses.rating) })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), isNull(courses.deletedAt)));

    const startOfMonth = sql`date_trunc('month', now())`;
    const [enrollmentsRow] = await this.db
      .select({ value: count() })
      .from(enrollments)
      .innerJoin(instructorCourses, eq(enrollments.courseId, instructorCourses.id))
      .where(sql`${enrollments.enrolledAt} >= ${startOfMonth}`);

    return {
      totalStudents: Number(studentsRow.value ?? 0),
      publishedCount: Number(publishedRow.value ?? 0),
      avgRating: ratingRow.value !== null ? Number(ratingRow.value) : null,
      newEnrollmentsThisMonth: Number(enrollmentsRow.value ?? 0),
    };
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const row = await this.db.query.courses.findFirst({
      where: excludeId
        ? and(eq(courses.slug, slug), not(eq(courses.id, excludeId)))
        : eq(courses.slug, slug),
      columns: { id: true },
    });
    return !!row;
  }

  // ── Modules ──────────────────────────────────────────────────────────────

  async findModuleById(id: string) {
    return this.db.query.modules.findFirst({ where: eq(modules.id, id) });
  }

  async nextModulePosition(courseId: string): Promise<number> {
    const [{ value }] = await this.db
      .select({ value: sql<number>`COALESCE(MAX(${modules.position}), -1) + 1` })
      .from(modules)
      .where(eq(modules.courseId, courseId));
    return Number(value);
  }

  async createModule(data: { courseId: string; title: string; description?: string }) {
    const position = await this.nextModulePosition(data.courseId);
    const [row] = await this.db
      .insert(modules)
      .values({ ...data, position })
      .returning();
    return row;
  }

  async updateModule(id: string, data: { title?: string; description?: string }) {
    const [row] = await this.db
      .update(modules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modules.id, id))
      .returning();
    return row;
  }

  async deleteModule(id: string) {
    await this.db.delete(modules).where(eq(modules.id, id));
  }

  async countLessonsInModule(moduleId: string): Promise<number> {
    const [{ value }] = await this.db
      .select({ value: count() })
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId));
    return Number(value);
  }

  async reorderModules(courseId: string, orderedIds: string[]) {
    await this.db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(modules)
          .set({ position: i, updatedAt: new Date() })
          .where(and(eq(modules.id, orderedIds[i]), eq(modules.courseId, courseId)));
      }
    });
  }

  async setModuleVisibility(moduleId: string, visibility: 'visible' | 'hidden') {
    const [row] = await this.db
      .update(modules)
      .set({ visibility, updatedAt: new Date() })
      .where(eq(modules.id, moduleId))
      .returning();
    return row;
  }

  // ── Lessons ──────────────────────────────────────────────────────────────

  async findLessonById(id: string) {
    return this.db.query.lessons.findFirst({ where: eq(lessons.id, id) });
  }

  async nextLessonPosition(moduleId: string): Promise<number> {
    const [{ value }] = await this.db
      .select({ value: sql<number>`COALESCE(MAX(${lessons.position}), -1) + 1` })
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId));
    return Number(value);
  }

  async createLesson(data: {
    moduleId: string;
    title: string;
    contentType?: 'video' | 'text' | 'quiz';
    youtubeUrl?: string;
    description?: string;
    duration?: number;
    resources?: Array<{ label: string; url: string }>;
  }) {
    const position = await this.nextLessonPosition(data.moduleId);
    const [row] = await this.db
      .insert(lessons)
      .values({ ...data, position })
      .returning();
    return row;
  }

  async updateLesson(id: string, data: Partial<{
    title: string;
    contentType: 'video' | 'text' | 'quiz';
    youtubeUrl: string | null;
    description: string | null;
    duration: number | null;
    resources: Array<{ label: string; url: string }> | null;
  }>) {
    const [row] = await this.db
      .update(lessons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return row;
  }

  async deleteLesson(id: string) {
    await this.db.delete(lessons).where(eq(lessons.id, id));
  }

  async reorderLessons(moduleId: string, orderedIds: string[]) {
    await this.db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(lessons)
          .set({ position: i, updatedAt: new Date() })
          .where(and(eq(lessons.id, orderedIds[i]), eq(lessons.moduleId, moduleId)));
      }
    });
  }

  async setLessonVisibility(lessonId: string, visibility: 'visible' | 'hidden') {
    const [row] = await this.db
      .update(lessons)
      .set({ visibility, updatedAt: new Date() })
      .where(eq(lessons.id, lessonId))
      .returning();
    return row;
  }

  async countModulesInCourse(courseId: string): Promise<number> {
    const [{ value }] = await this.db
      .select({ value: count() })
      .from(modules)
      .where(eq(modules.courseId, courseId));
    return Number(value);
  }
}
