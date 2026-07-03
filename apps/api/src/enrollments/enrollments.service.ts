import { ConflictException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { EnrollmentsRepository } from './enrollments.repository';
import { ProgressRepository } from '../progress/progress.repository';
import { MailService } from '../mail/mail.service';
import { t } from '../i18n/translate';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    private readonly repo: EnrollmentsRepository,
    private readonly progressRepo: ProgressRepository,
    private readonly mailService: MailService,
  ) {}

  async enroll(studentId: string, courseId: string) {
    // Curso somente-turma não aceita matrícula on demand (US-22/23)
    const accessMode = await this.repo.findCourseAccessMode(courseId);
    if (accessMode === 'cohort') {
      throw new UnprocessableEntityException(t('enrollments.cohort_only'));
    }
    // Aluno vinculado a uma turma deste curso perde o on demand (US-23)
    if (await this.repo.hasCohortEnrollment(studentId, courseId)) {
      throw new ConflictException(t('enrollments.already_in_cohort'));
    }

    const enrollment = await this.repo.create(studentId, courseId);
    if (!enrollment) throw new ConflictException(t('enrollments.already_enrolled'));

    this.sendWelcomeEmail(studentId, courseId);

    return enrollment;
  }

  private sendWelcomeEmail(studentId: string, courseId: string): void {
    Promise.all([
      this.repo.findStudentEmailById(studentId),
      this.repo.findCourseBasicById(courseId),
    ])
      .then(([email, course]) => {
        if (!email || !course) return;
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        const courseUrl = `${frontendUrl}/courses/${course.slug}`;
        return this.mailService.sendEnrollmentWelcome(email, course.title, courseUrl);
      })
      .catch((err: unknown) => {
        this.logger.error('Failed to send enrollment welcome email', err);
      });
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
