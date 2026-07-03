import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, eq, sql } from 'drizzle-orm';
import {
  cohorts, cohortModuleSchedules, cohortEnrollments, enrollments, courses, modules,
  type NewCohort,
} from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class CohortsRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  async insert(data: NewCohort) {
    const [cohort] = await this.db.insert(cohorts).values(data).returning();
    return cohort;
  }

  findById(id: string) {
    return this.db.query.cohorts.findFirst({ where: eq(cohorts.id, id) });
  }

  findByCourse(courseId: string) {
    return this.db.query.cohorts.findMany({
      where: eq(cohorts.courseId, courseId),
      orderBy: [asc(cohorts.enrollmentStart)],
    });
  }

  async update(id: string, data: Partial<Omit<NewCohort, 'id' | 'courseId' | 'createdAt'>>) {
    const [cohort] = await this.db
      .update(cohorts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cohorts.id, id))
      .returning();
    return cohort;
  }

  findSchedule(cohortId: string) {
    return this.db.query.cohortModuleSchedules.findMany({
      where: eq(cohortModuleSchedules.cohortId, cohortId),
    });
  }

  /** Substitui o cronograma inteiro da turma (upsert em lote). */
  async replaceSchedule(cohortId: string, entries: Array<{ moduleId: string; availableFrom: Date }>) {
    await this.db.transaction(async (tx) => {
      await tx.delete(cohortModuleSchedules).where(eq(cohortModuleSchedules.cohortId, cohortId));
      if (entries.length > 0) {
        await tx.insert(cohortModuleSchedules).values(
          entries.map((e) => ({ cohortId, moduleId: e.moduleId, availableFrom: e.availableFrom })),
        );
      }
    });
  }

  async findModuleIdsByCourse(courseId: string): Promise<string[]> {
    const rows = await this.db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.courseId, courseId));
    return rows.map((r) => r.id);
  }

  // ── Inscrições (US-23) ────────────────────────────────────────────────────

  /** O aluno já está em alguma turma deste curso? */
  async hasCohortEnrollmentInCourse(studentId: string, courseId: string): Promise<boolean> {
    const rows = await this.db
      .select({ n: count() })
      .from(cohortEnrollments)
      .innerJoin(cohorts, eq(cohorts.id, cohortEnrollments.cohortId))
      .where(and(eq(cohortEnrollments.studentId, studentId), eq(cohorts.courseId, courseId)));
    return Number(rows[0]?.n ?? 0) > 0;
  }

  /** O aluno já tem matrícula (on demand) no curso? */
  async hasBaseEnrollment(studentId: string, courseId: string): Promise<boolean> {
    const row = await this.db.query.enrollments.findFirst({
      where: and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)),
    });
    return row !== undefined;
  }

  /**
   * Inscreve na turma com verificação de vaga em SQL condicional (sem corrida)
   * e cria a matrícula base do curso na mesma transação.
   */
  async enrollTransaction(
    cohortId: string,
    studentId: string,
    courseId: string,
    seats: number,
  ): Promise<'ok' | 'full'> {
    return this.db.transaction(async (tx) => {
      const inserted = await tx.execute(sql`
        INSERT INTO cohort_enrollments (cohort_id, student_id)
        SELECT ${cohortId}, ${studentId}
        WHERE (SELECT count(*) FROM cohort_enrollments WHERE cohort_id = ${cohortId}) < ${seats}
        ON CONFLICT DO NOTHING
        RETURNING cohort_id
      `);
      const rows = (inserted as unknown as { rows?: unknown[] }).rows
        ?? (inserted as unknown as unknown[]);
      if (!rows || (Array.isArray(rows) && rows.length === 0)) return 'full';

      await tx.insert(enrollments).values({ studentId, courseId }).onConflictDoNothing();
      return 'ok';
    });
  }

  /** Turmas do curso com contagem de inscritos (lista pública da página do curso). */
  async findPublicByCourse(courseId: string) {
    const rows = await this.db
      .select({
        id: cohorts.id,
        courseId: cohorts.courseId,
        name: cohorts.name,
        enrollmentStart: cohorts.enrollmentStart,
        enrollmentEnd: cohorts.enrollmentEnd,
        seats: cohorts.seats,
        closedAt: cohorts.closedAt,
        createdAt: cohorts.createdAt,
        updatedAt: cohorts.updatedAt,
        enrolledCount: sql<number>`(
          SELECT count(*) FROM cohort_enrollments ce WHERE ce.cohort_id = ${cohorts.id}
        )`,
      })
      .from(cohorts)
      .where(eq(cohorts.courseId, courseId))
      .orderBy(asc(cohorts.enrollmentStart));
    return rows.map((r) => ({ ...r, enrolledCount: Number(r.enrolledCount ?? 0) }));
  }

  /** Turmas em que o aluno está matriculado, com curso e cronograma. */
  async findByStudent(studentId: string) {
    const rows = await this.db
      .select({
        id: cohorts.id,
        courseId: cohorts.courseId,
        name: cohorts.name,
        enrollmentStart: cohorts.enrollmentStart,
        enrollmentEnd: cohorts.enrollmentEnd,
        seats: cohorts.seats,
        closedAt: cohorts.closedAt,
        createdAt: cohorts.createdAt,
        updatedAt: cohorts.updatedAt,
        enrolledAt: cohortEnrollments.enrolledAt,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        courseThumbnailUrl: courses.thumbnailUrl,
      })
      .from(cohortEnrollments)
      .innerJoin(cohorts, eq(cohorts.id, cohortEnrollments.cohortId))
      .innerJoin(courses, eq(courses.id, cohorts.courseId))
      .where(eq(cohortEnrollments.studentId, studentId))
      .orderBy(asc(cohorts.enrollmentStart));

    return Promise.all(rows.map(async (r) => {
      const schedule = await this.db
        .select({
          moduleId: cohortModuleSchedules.moduleId,
          availableFrom: cohortModuleSchedules.availableFrom,
          moduleTitle: modules.title,
          modulePosition: modules.position,
        })
        .from(cohortModuleSchedules)
        .innerJoin(modules, eq(modules.id, cohortModuleSchedules.moduleId))
        .where(eq(cohortModuleSchedules.cohortId, r.id))
        .orderBy(asc(modules.position));

      return {
        id: r.id,
        courseId: r.courseId,
        name: r.name,
        enrollmentStart: r.enrollmentStart,
        enrollmentEnd: r.enrollmentEnd,
        seats: r.seats,
        closedAt: r.closedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        enrolledAt: r.enrolledAt,
        course: { title: r.courseTitle, slug: r.courseSlug, thumbnailUrl: r.courseThumbnailUrl },
        schedule,
      };
    }));
  }
}
