import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, sum, isNull } from 'drizzle-orm';
import {
  enrollments,
  courses,
  categories,
  modules,
  lessons,
  users,
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
        totalDurationSeconds: sum(lessons.duration),
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
}
