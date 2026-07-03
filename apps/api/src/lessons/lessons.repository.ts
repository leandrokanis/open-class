import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ne, sql } from 'drizzle-orm';
import { lessons, lessonResources, type NewLesson } from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class LessonsRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  findByModule(moduleId: string) {
    return this.db.query.lessons.findMany({
      where: eq(lessons.moduleId, moduleId),
      orderBy: [lessons.isExtra, lessons.position],
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

  async nextPosition(moduleId: string, isExtra = false): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`coalesce(max(${lessons.position}), 0)` })
      .from(lessons)
      .where(and(eq(lessons.moduleId, moduleId), eq(lessons.isExtra, isExtra)));
    return (result[0]?.max ?? 0) + 1;
  }

  async updatePosition(id: string, position: number) {
    await this.db.update(lessons).set({ position }).where(eq(lessons.id, id));
  }

  async findGroupIds(moduleId: string, isExtra: boolean): Promise<string[]> {
    const rows = await this.db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.moduleId, moduleId), eq(lessons.isExtra, isExtra)))
      .orderBy(lessons.position);
    return rows.map((r) => r.id);
  }

  /** Renumera as posições de um grupo (normais ou extras) para 1..K preservando a ordem. */
  async compactGroup(moduleId: string, isExtra: boolean) {
    const ids = await this.findGroupIds(moduleId, isExtra);
    await Promise.all(ids.map((id, i) => this.updatePosition(id, i + 1)));
  }

  /** Curso ao qual a turma pertence (validação de aula exclusiva — US-25). */
  async findCohortCourseId(cohortId: string): Promise<string | null> {
    const rows = await this.db.execute(sql`
      SELECT course_id AS "courseId" FROM cohorts WHERE id = ${cohortId} LIMIT 1
    `);
    const first = (rows as unknown as { rows?: Array<{ courseId: string }> }).rows?.[0]
      ?? (rows as unknown as Array<{ courseId: string }>)[0];
    return first?.courseId ?? null;
  }

  /** O aluno está na turma? A turma está encerrada? (acesso a exclusivas — US-25) */
  async findCohortAccess(studentId: string, cohortId: string) {
    const rows = await this.db.execute(sql`
      SELECT (c.closed_at IS NOT NULL) AS "closed"
      FROM cohort_enrollments ce
      JOIN cohorts c ON c.id = ce.cohort_id
      WHERE ce.cohort_id = ${cohortId} AND ce.student_id = ${studentId}
      LIMIT 1
    `);
    const first = (rows as unknown as { rows?: Array<{ closed: boolean }> }).rows?.[0]
      ?? (rows as unknown as Array<{ closed: boolean }>)[0];
    if (!first) return null;
    return { enrolled: true, closed: Boolean(first.closed) };
  }

  /**
   * Lock de cronograma de turma para um módulo (US-24).
   * null → aluno não está em turma do curso deste módulo.
   * availableFrom null → módulo sem data no cronograma (liberado desde o início).
   * cohortClosed → encerramento manual da turma (libera o conteúdo regular).
   */
  async findCohortModuleLock(studentId: string, moduleId: string) {
    const rows = await this.db.execute(sql`
      SELECT cms.available_from AS "availableFrom",
             (c.closed_at IS NOT NULL) AS "cohortClosed"
      FROM modules m
      JOIN cohorts c ON c.course_id = m.course_id
      JOIN cohort_enrollments ce ON ce.cohort_id = c.id AND ce.student_id = ${studentId}
      LEFT JOIN cohort_module_schedules cms ON cms.cohort_id = c.id AND cms.module_id = m.id
      WHERE m.id = ${moduleId}
      LIMIT 1
    `);
    const first = (rows as unknown as { rows?: Array<{ availableFrom: Date | string | null; cohortClosed: boolean }> }).rows?.[0]
      ?? (rows as unknown as Array<{ availableFrom: Date | string | null; cohortClosed: boolean }>)[0];
    if (!first) return null;
    return {
      availableFrom: first.availableFrom ? new Date(first.availableFrom) : null,
      cohortClosed: Boolean(first.cohortClosed),
    };
  }

  /** O aluno concluiu todas as normais visíveis do módulo? (extras desbloqueadas — US-20) */
  async isExtraUnlockedFor(studentId: string, moduleId: string): Promise<boolean> {
    const rows = await this.db.execute(sql`
      SELECT
        count(*) FILTER (WHERE l.is_extra = false AND l.visibility = 'visible' AND l.cohort_id IS NULL) AS total,
        count(*) FILTER (
          WHERE l.is_extra = false AND l.visibility = 'visible' AND l.cohort_id IS NULL
            AND lp.is_completed = true
        ) AS completed
      FROM lessons l
      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.id AND lp.student_id = ${studentId}
      WHERE l.module_id = ${moduleId}
    `);
    const first = (rows as unknown as { rows?: Array<{ total: number; completed: number }> }).rows?.[0]
      ?? (rows as unknown as Array<{ total: number; completed: number }>)[0];
    return Number(first?.total ?? 0) === Number(first?.completed ?? 0);
  }

  /**
   * Alunos matriculados no curso do módulo que concluíram todas as aulas
   * normais visíveis — ou seja, que já desbloquearam as extras (US-21).
   * Módulo sem aulas normais visíveis → todos os matriculados contam.
   */
  async countExtraUnlockedStudents(moduleId: string): Promise<number> {
    const rows = await this.db.execute(sql`
      WITH module_course AS (
        SELECT course_id FROM modules WHERE id = ${moduleId}
      ),
      normals AS (
        SELECT id FROM lessons
        WHERE module_id = ${moduleId} AND is_extra = false AND visibility = 'visible'
          AND cohort_id IS NULL
      ),
      enrolled AS (
        SELECT e.student_id FROM enrollments e
        JOIN module_course mc ON e.course_id = mc.course_id
      )
      SELECT count(*)::int AS unlocked FROM enrolled en
      WHERE (SELECT count(*) FROM normals) = (
        SELECT count(*) FROM lesson_progress lp
        JOIN normals n ON n.id = lp.lesson_id
        WHERE lp.student_id = en.student_id AND lp.is_completed = true
      )
    `);
    const first = (rows as unknown as { rows?: Array<{ unlocked: number }> }).rows?.[0]
      ?? (rows as unknown as Array<{ unlocked: number }>)[0];
    return Number(first?.unlocked ?? 0);
  }

  async moveToModule(id: string, sourceModuleId: string, targetModuleId: string, position: number) {
    return this.db.transaction(async (tx) => {
      // O grupo (normal/extra) acompanha a aula; compactação e inserção são por grupo
      const moved = await tx.query.lessons.findFirst({ where: eq(lessons.id, id) });
      const group = moved?.isExtra ?? false;

      // 1. Move lesson to target module with a temporary high position to avoid constraint conflicts
      await tx
        .update(lessons)
        .set({ moduleId: targetModuleId, position: 999999, updatedAt: new Date() })
        .where(eq(lessons.id, id));

      // 2. Compact source module group (excluding the moved lesson, now in target)
      const sourceRows = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.moduleId, sourceModuleId), eq(lessons.isExtra, group), ne(lessons.id, id)))
        .orderBy(lessons.position);
      await Promise.all(sourceRows.map((r, i) =>
        tx.update(lessons).set({ position: i + 1 }).where(eq(lessons.id, r.id)),
      ));

      // 3. Reorder target module group: insert moved lesson at requested position
      const targetOthers = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.moduleId, targetModuleId), eq(lessons.isExtra, group), ne(lessons.id, id)))
        .orderBy(lessons.position);

      const newOrder = targetOthers.map((r) => r.id);
      newOrder.splice(Math.max(0, position - 1), 0, id);
      await Promise.all(newOrder.map((lid, i) =>
        tx.update(lessons).set({ position: i + 1 }).where(eq(lessons.id, lid)),
      ));

      // 4. Return updated lesson
      const [updated] = await tx
        .update(lessons)
        .set({ updatedAt: new Date() })
        .where(eq(lessons.id, id))
        .returning();
      return updated;
    });
  }
}
