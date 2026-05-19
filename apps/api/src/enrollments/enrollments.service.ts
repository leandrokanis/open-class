import { ConflictException, Injectable } from '@nestjs/common';
import { EnrollmentsRepository } from './enrollments.repository';
import { ProgressRepository } from '../progress/progress.repository';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly repo: EnrollmentsRepository,
    private readonly progressRepo: ProgressRepository,
  ) {}

  async enroll(studentId: string, courseId: string) {
    const enrollment = await this.repo.create(studentId, courseId);
    if (!enrollment) throw new ConflictException('Aluno já matriculado neste curso.');
    return enrollment;
  }

  async findByStudent(studentId: string) {
    const enrollments = await this.repo.findByStudent(studentId);

    const active = enrollments.filter((e) => e.status !== 'cancelled');

    return Promise.all(
      active.map(async (enrollment) => {
        const [stats, lastLesson] = await Promise.all([
          this.progressRepo.getCompletionStats(studentId, enrollment.course.id),
          this.progressRepo.getLastAccessedLesson(studentId, enrollment.course.id),
        ]);

        const { completed, total } = stats;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10;

        return {
          id:         enrollment.id,
          status:     enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          course:     enrollment.course,
          progress: {
            completedLessons: completed,
            totalLessons:     total,
            percentage,
          },
          lastLesson: lastLesson
            ? { id: lastLesson.id, title: lastLesson.title }
            : null,
        };
      }),
    );
  }

  findAll() {
    throw new Error('Not implemented');
  }
}
