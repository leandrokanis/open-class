import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, sum, isNull } from 'drizzle-orm';
import {
  enrollments,
  courses,
  categories,
  modules,
  lessons,
  users,
  cohorts,
  cohortEnrollments,
  type EnrollmentStatus,
} from '@open-class/db';
import type { Db } from '../db';

export interface EnrollmentRow {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  course: {
    id: string;
    title: string;
    slug: string;
    level: string | null;
    thumbnailUrl: string | null;
    totalDurationMinutes: number;
    category: { id: string; name: string; slug: string } | null;
    instructor: { name: string };
  };
}

@Injectable()
export class EnrollmentsRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  async findByStudent(studentId: string): Promise<EnrollmentRow[]> {
    const lessonStats = this.db
      .select({
        courseId: courses.id,
        lessonCount: count(lessons.id),
        totalDurationSeconds: sum(lessons.duration).as('totalDurationSeconds'),
      })
      .from(courses)
      .innerJoin(modules, eq(modules.courseId, courses.id))
      .innerJoin(
        lessons,
        and(eq(lessons.moduleId, modules.id), eq(lessons.visibility, 'visible')),
      )
      .where(isNull(courses.deletedAt))
      .groupBy(courses.id)
      .as('lesson_stats');

    const rows = await this.db
      .select({
        id:            enrollments.id,
        status:        enrollments.status,
        enrolledAt:    enrollments.enrolledAt,
        courseId:      courses.id,
        courseTitle:   courses.title,
        courseSlug:    courses.slug,
        courseLevel:   courses.level,
        courseThumbnail: courses.thumbnailUrl,
        totalDurationSeconds: lessonStats.totalDurationSeconds,
        categoryId:   categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        instructorName: users.name,
      })
      .from(enrollments)
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .leftJoin(categories, eq(categories.id, courses.categoryId))
      .innerJoin(users, eq(users.id, courses.instructorId))
      .leftJoin(lessonStats, eq(lessonStats.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId));

    return rows.map((r) => ({
      id:         r.id,
      status:     r.status,
      enrolledAt: r.enrolledAt,
      course: {
        id:           r.courseId,
        title:        r.courseTitle,
        slug:         r.courseSlug,
        level:        r.courseLevel ?? null,
        thumbnailUrl: r.courseThumbnail ?? null,
        totalDurationMinutes: Math.round(Number(r.totalDurationSeconds ?? 0) / 60),
        category: r.categoryId
          ? { id: r.categoryId, name: r.categoryName!, slug: r.categorySlug! }
          : null,
        instructor: { name: r.instructorName },
      },
    }));
  }

  async create(studentId: string, courseId: string) {
    const [row] = await this.db
      .insert(enrollments)
      .values({ studentId, courseId })
      .onConflictDoNothing()
      .returning();
    return row ?? null;
  }

  async findCourseBasicById(courseId: string): Promise<{ title: string; slug: string } | null> {
    const [row] = await this.db
      .select({ title: courses.title, slug: courses.slug })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    return row ?? null;
  }

  async findStudentEmailById(studentId: string): Promise<string | null> {
    const [row] = await this.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);
    return row?.email ?? null;
  }

  /** Modo de acesso do curso (US-22). */
  async findCourseAccessMode(courseId: string): Promise<'on_demand' | 'cohort' | 'both' | null> {
    const [row] = await this.db
      .select({ accessMode: courses.accessMode })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    return row?.accessMode ?? null;
  }

  /** O aluno está vinculado a alguma turma deste curso? (US-23) */
  async hasCohortEnrollment(studentId: string, courseId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ n: count() })
      .from(cohortEnrollments)
      .innerJoin(cohorts, eq(cohorts.id, cohortEnrollments.cohortId))
      .where(and(eq(cohortEnrollments.studentId, studentId), eq(cohorts.courseId, courseId)));
    return Number(row?.n ?? 0) > 0;
  }
}
