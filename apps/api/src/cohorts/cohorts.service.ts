import {
  Injectable, NotFoundException, ForbiddenException, UnprocessableEntityException,
} from '@nestjs/common';
import { CohortsRepository } from './cohorts.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { t } from '../i18n/translate';
import type { CreateCohortDto } from './dto/create-cohort.dto';
import type { UpdateCohortDto } from './dto/update-cohort.dto';
import type { ScheduleEntryDto } from './dto/set-schedule.dto';

export type CohortStatus = 'agendada' | 'aberta' | 'encerrada';

interface CohortLike {
  enrollmentStart: Date;
  enrollmentEnd: Date;
  closedAt: Date | null;
}

@Injectable()
export class CohortsService {
  constructor(
    private readonly repo: CohortsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async create(courseId: string, dto: CreateCohortDto, userId: string, userRole: string) {
    await this.assertCourseOwnership(courseId, userId, userRole);
    const enrollmentStart = new Date(dto.enrollmentStart);
    const enrollmentEnd = new Date(dto.enrollmentEnd);
    this.assertPeriod(enrollmentStart, enrollmentEnd);

    const cohort = await this.repo.insert({
      courseId,
      name: dto.name,
      enrollmentStart,
      enrollmentEnd,
      seats: dto.seats,
    });
    return this.withStatus(cohort);
  }

  async listByCourse(courseId: string, userId: string, userRole: string) {
    await this.assertCourseOwnership(courseId, userId, userRole);
    const rows = await this.repo.findByCourse(courseId);
    return rows.map((c) => this.withStatus(c));
  }

  async findById(id: string, userId: string, userRole: string) {
    const cohort = await this.repo.findById(id);
    if (!cohort) throw new NotFoundException(t('cohorts.not_found'));
    await this.assertCourseOwnership(cohort.courseId, userId, userRole);
    const schedule = await this.repo.findSchedule(id);
    return { ...this.withStatus(cohort), schedule };
  }

  async update(id: string, dto: UpdateCohortDto, userId: string, userRole: string) {
    const cohort = await this.repo.findById(id);
    if (!cohort) throw new NotFoundException(t('cohorts.not_found'));
    await this.assertCourseOwnership(cohort.courseId, userId, userRole);

    const enrollmentStart = dto.enrollmentStart ? new Date(dto.enrollmentStart) : cohort.enrollmentStart;
    const enrollmentEnd = dto.enrollmentEnd ? new Date(dto.enrollmentEnd) : cohort.enrollmentEnd;
    this.assertPeriod(enrollmentStart, enrollmentEnd);

    const updated = await this.repo.update(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.seats !== undefined ? { seats: dto.seats } : {}),
      ...(dto.enrollmentStart !== undefined ? { enrollmentStart } : {}),
      ...(dto.enrollmentEnd !== undefined ? { enrollmentEnd } : {}),
    });
    return this.withStatus(updated);
  }

  /** Encerramento manual — idempotente para turma já encerrada. */
  async close(id: string, userId: string, userRole: string) {
    const cohort = await this.repo.findById(id);
    if (!cohort) throw new NotFoundException(t('cohorts.not_found'));
    await this.assertCourseOwnership(cohort.courseId, userId, userRole);

    if (cohort.closedAt) return this.withStatus(cohort);

    const updated = await this.repo.update(id, { closedAt: new Date() });
    return this.withStatus(updated);
  }

  async setSchedule(id: string, entries: ScheduleEntryDto[], userId: string, userRole: string) {
    const cohort = await this.repo.findById(id);
    if (!cohort) throw new NotFoundException(t('cohorts.not_found'));
    await this.assertCourseOwnership(cohort.courseId, userId, userRole);

    const courseModuleIds = new Set(await this.repo.findModuleIdsByCourse(cohort.courseId));
    const invalid = entries.filter((e) => !courseModuleIds.has(e.moduleId));
    if (invalid.length > 0) {
      throw new UnprocessableEntityException(t('cohorts.module_not_in_course'));
    }

    await this.repo.replaceSchedule(
      id,
      entries.map((e) => ({ moduleId: e.moduleId, availableFrom: new Date(e.availableFrom) })),
    );
    const schedule = await this.repo.findSchedule(id);
    return { ...this.withStatus(cohort), schedule };
  }

  statusOf(cohort: CohortLike, now: Date = new Date()): CohortStatus {
    if (cohort.closedAt) return 'encerrada';
    if (now < cohort.enrollmentStart) return 'agendada';
    if (now > cohort.enrollmentEnd) return 'encerrada';
    return 'aberta';
  }

  private withStatus<T extends CohortLike>(cohort: T) {
    return { ...cohort, status: this.statusOf(cohort) };
  }

  private assertPeriod(start: Date, end: Date) {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      throw new UnprocessableEntityException(t('cohorts.invalid_period'));
    }
  }

  private async assertCourseOwnership(courseId: string, userId: string, userRole: string) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (userRole !== 'admin' && course.instructorId !== userId) {
      throw new ForbiddenException(t('cohorts.no_permission'));
    }
  }
}
