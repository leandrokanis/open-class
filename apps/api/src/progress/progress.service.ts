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

  async getLastAccessed(studentId: string, courseId: string) {
    const course = await this.repo.findCourseById(courseId);
    if (!course) throw new NotFoundException(t('progress.course_not_found'));

    const enrolled = await this.repo.isEnrolled(studentId, courseId);
    if (!enrolled) throw new ForbiddenException(t('enrollments.not_enrolled'));

    const lesson = await this.repo.getLastAccessedLesson(studentId, courseId);
    return { lastAccessedLesson: lesson };
  }
}
