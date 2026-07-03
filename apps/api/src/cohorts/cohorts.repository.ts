import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { cohorts, cohortModuleSchedules, modules, type NewCohort } from '@open-class/db';
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
}
