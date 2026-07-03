import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProgressRepository } from './progress.repository';
import { t } from '../i18n/translate';

@Injectable()
export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  async markLesson(studentId: string, lessonId: string, isCompleted: boolean) {
    const lesson = await this.repo.findLessonWithCourse(lessonId);
    if (!lesson) throw new NotFoundException(t('progress.lesson_not_found'));

    const courseId = lesson.module.courseId;
    const enrolled = await this.repo.isEnrolled(studentId, courseId);
    if (!enrolled) throw new ForbiddenException(t('enrollments.not_enrolled'));

    // Extra bloqueada: só pode ser marcada após concluir as normais do módulo (US-20)
    if (lesson.isExtra) {
      const unlocked = await this.repo.hasCompletedAllNormals(studentId, lesson.moduleId);
      if (!unlocked) throw new ForbiddenException(t('progress.extra_locked'));
    }

    // Cronograma de turma: módulo ainda não liberado bloqueia a marcação (US-24)
    const lock = await this.repo.findCohortModuleLock(studentId, lesson.moduleId);
    if (lock && !lock.cohortClosed && lock.availableFrom && lock.availableFrom > new Date()) {
      throw new ForbiddenException(t('cohorts.module_locked'));
    }

    const progress = await this.repo.upsertProgress(studentId, lessonId, isCompleted);
    return {
      lessonId:    progress.lessonId,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
      updatedAt:   progress.updatedAt,
    };
  }

  async getCourseProgress(studentId: string, courseId: string) {
    const course = await this.repo.findCourseById(courseId);
    if (!course) throw new NotFoundException(t('progress.course_not_found'));

    const enrolled = await this.repo.isEnrolled(studentId, courseId);
    if (!enrolled) throw new ForbiddenException(t('enrollments.not_enrolled'));

    const { completed, total } = await this.repo.getCompletionStats(studentId, courseId);
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10;

    return { courseId, completedLessons: completed, totalLessons: total, percentage };
  }

  async getCompletedLessonIds(studentId: string, courseId: string): Promise<string[]> {
    const enrolled = await this.repo.isEnrolled(studentId, courseId);
    if (!enrolled) throw new ForbiddenException(t('enrollments.not_enrolled'));

    return this.repo.getCompletedLessonIds(studentId, courseId);
  }

  async getRecentActivity(studentId: string, limit: number) {
    return this.repo.getRecentActivity(studentId, limit);
  }

  /** Status das aulas extras por módulo do curso (US-20). */
  async getExtrasStatus(studentId: string, courseId: string) {
    const enrolled = await this.repo.isEnrolled(studentId, courseId);
    if (!enrolled) throw new ForbiddenException(t('enrollments.not_enrolled'));

    const rows = await this.repo.getExtrasStatus(studentId, courseId);
    return rows.map((r) => ({
      moduleId: r.moduleId,
      hasExtras: r.extrasCount > 0,
      // Desbloqueio computado: todas as normais concluídas (vácuo se não há normais).
      // Só é relevante quando o módulo tem extras.
      unlocked: r.extrasCount > 0 && r.normalsCompleted === r.normalsTotal,
      celebrated: r.celebrated,
    }));
  }

  /** Registra a celebração de desbloqueio — idempotente, uma vez por módulo (US-20). */
  async celebrateExtras(studentId: string, moduleId: string) {
    const courseId = await this.repo.findModuleCourseId(moduleId);
    if (!courseId) throw new NotFoundException(t('modules.not_found'));

    const enrolled = await this.repo.isEnrolled(studentId, courseId);
    if (!enrolled) throw new ForbiddenException(t('enrollments.not_enrolled'));

    await this.repo.upsertExtrasCelebration(studentId, moduleId);
    return { celebrated: true };
  }

  async getLastAccessed(studentId: string, courseId: string) {
    const course = await this.repo.findCourseById(courseId);
    if (!course) throw new NotFoundException(t('progress.course_not_found'));

    const enrolled = await this.repo.isEnrolled(studentId, courseId);
    if (!enrolled) throw new ForbiddenException(t('enrollments.not_enrolled'));

    const lesson = await this.repo.getLastAccessedLesson(studentId, courseId);
    return { lastAccessedLesson: lesson };
  }
}
