import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, sql, desc, asc } from 'drizzle-orm';
import {
  lessonProgress,
  lessons,
  modules,
  courses,
  enrollments,
  extraUnlockCelebrations,
  type NewLessonProgress,
} from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class ProgressRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const row = await this.db.query.enrollments.findFirst({
      where: and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)),
    });
    return row !== undefined;
  }

  async findLessonWithCourse(lessonId: string) {
    const rows = await this.db
      .select({
        id:       lessons.id,
        title:    lessons.title,
        moduleId: lessons.moduleId,
        isExtra:  lessons.isExtra,
        module:   { id: modules.id, courseId: modules.courseId },
      })
      .from(lessons)
      .innerJoin(modules, eq(modules.id, lessons.moduleId))
      .where(eq(lessons.id, lessonId))
      .limit(1);
    return rows[0] ?? null;
  }

  async upsertProgress(
    studentId: string,
    lessonId: string,
    isCompleted: boolean,
  ) {
    const completedAt = isCompleted ? new Date() : null;
    const values: NewLessonProgress = {
      studentId,
      lessonId,
      isCompleted,
      completedAt,
    };
    const [row] = await this.db
      .insert(lessonProgress)
      .values(values)
      .onConflictDoUpdate({
        target: [lessonProgress.studentId, lessonProgress.lessonId],
        set: {
          isCompleted,
          completedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async getCompletionStats(
    studentId: string,
    courseId: string,
  ): Promise<{ completed: number; total: number }> {
    const rows = await this.db
      .select({
        completed: sql<number>`COUNT(*) FILTER (WHERE ${lessonProgress.isCompleted} = true)`,
        total:     count(),
      })
      .from(lessons)
      .innerJoin(modules, eq(modules.id, lessons.moduleId))
      .leftJoin(
        lessonProgress,
        and(
          eq(lessonProgress.lessonId, lessons.id),
          eq(lessonProgress.studentId, studentId),
        ),
      )
      .where(and(
        eq(modules.courseId, courseId),
        eq(lessons.visibility, 'visible'),
        // Extras não contam para o percentual: só aulas normais determinam 100% (US-20)
        eq(lessons.isExtra, false),
      ));

    const { completed, total } = rows[0] ?? { completed: 0, total: 0 };
    return { completed: Number(completed), total: Number(total) };
  }

  /** O aluno concluiu todas as aulas normais visíveis do módulo? (desbloqueio das extras) */
  async hasCompletedAllNormals(studentId: string, moduleId: string): Promise<boolean> {
    const rows = await this.db
      .select({
        completed: sql<number>`COUNT(*) FILTER (WHERE ${lessonProgress.isCompleted} = true)`,
        total:     count(),
      })
      .from(lessons)
      .leftJoin(
        lessonProgress,
        and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.studentId, studentId)),
      )
      .where(and(
        eq(lessons.moduleId, moduleId),
        eq(lessons.visibility, 'visible'),
        eq(lessons.isExtra, false),
      ));
    const { completed, total } = rows[0] ?? { completed: 0, total: 0 };
    return Number(completed) === Number(total);
  }

  /** Por módulo visível do curso: contagens para o status de extras do aluno (US-20). */
  async getExtrasStatus(studentId: string, courseId: string) {
    const rows = await this.db
      .select({
        moduleId: modules.id,
        extrasCount: sql<number>`COUNT(*) FILTER (WHERE ${lessons.isExtra} = true AND ${lessons.visibility} = 'visible')`,
        normalsTotal: sql<number>`COUNT(*) FILTER (WHERE ${lessons.isExtra} = false AND ${lessons.visibility} = 'visible')`,
        normalsCompleted: sql<number>`COUNT(*) FILTER (WHERE ${lessons.isExtra} = false AND ${lessons.visibility} = 'visible' AND ${lessonProgress.isCompleted} = true)`,
        celebrated: sql<boolean>`bool_or(${extraUnlockCelebrations.studentId} IS NOT NULL)`,
      })
      .from(modules)
      .leftJoin(lessons, eq(lessons.moduleId, modules.id))
      .leftJoin(
        lessonProgress,
        and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.studentId, studentId)),
      )
      .leftJoin(
        extraUnlockCelebrations,
        and(
          eq(extraUnlockCelebrations.moduleId, modules.id),
          eq(extraUnlockCelebrations.studentId, studentId),
        ),
      )
      .where(and(eq(modules.courseId, courseId), eq(modules.visibility, 'visible')))
      .groupBy(modules.id, modules.position)
      .orderBy(asc(modules.position));

    return rows.map((r) => ({
      moduleId: r.moduleId,
      extrasCount: Number(r.extrasCount ?? 0),
      normalsTotal: Number(r.normalsTotal ?? 0),
      normalsCompleted: Number(r.normalsCompleted ?? 0),
      celebrated: Boolean(r.celebrated),
    }));
  }

  async upsertExtrasCelebration(studentId: string, moduleId: string): Promise<void> {
    await this.db
      .insert(extraUnlockCelebrations)
      .values({ studentId, moduleId })
      .onConflictDoNothing();
  }

  async findModuleCourseId(moduleId: string): Promise<string | null> {
    const row = await this.db.query.modules.findFirst({
      where: eq(modules.id, moduleId),
      columns: { courseId: true },
    });
    return row?.courseId ?? null;
  }

  async getLastAccessedLesson(studentId: string, courseId: string) {
    const rows = await this.db
      .select({
        id:        lessons.id,
        title:     lessons.title,
        moduleId:  lessons.moduleId,
        position:  lessons.position,
        updatedAt: lessonProgress.updatedAt,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .innerJoin(modules, eq(modules.id, lessons.moduleId))
      .where(
        and(
          eq(lessonProgress.studentId, studentId),
          eq(modules.courseId, courseId),
        ),
      )
      .orderBy(sql`${lessonProgress.updatedAt} DESC`)
      .limit(1);

    return rows[0] ?? null;
  }

  async getCompletedLessonIds(studentId: string, courseId: string): Promise<string[]> {
    const rows = await this.db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .innerJoin(modules, eq(modules.id, lessons.moduleId))
      .where(
        and(
          eq(lessonProgress.studentId, studentId),
          eq(modules.courseId, courseId),
          eq(lessonProgress.isCompleted, true),
        ),
      );
    return rows.map((r) => r.lessonId);
  }

  findCourseById(courseId: string) {
    return this.db.query.courses.findFirst({
      where: (c, { eq: eqFn, isNull, and: andFn }) =>
        andFn(eqFn(c.id, courseId), isNull(c.deletedAt)),
    });
  }

  async getRecentActivity(studentId: string, limit: number) {
    const rows = await this.db
      .select({
        lessonId:    lessonProgress.lessonId,
        lessonTitle: lessons.title,
        courseId:    courses.id,
        courseTitle: courses.title,
        courseSlug:  courses.slug,
        isCompleted: lessonProgress.isCompleted,
        updatedAt:   lessonProgress.updatedAt,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .innerJoin(modules, eq(modules.id, lessons.moduleId))
      .innerJoin(courses, eq(courses.id, modules.courseId))
      .where(eq(lessonProgress.studentId, studentId))
      .orderBy(desc(lessonProgress.updatedAt))
      .limit(limit);

    return rows;
  }
}
