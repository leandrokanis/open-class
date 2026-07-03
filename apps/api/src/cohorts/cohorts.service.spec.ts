import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  NotFoundException, ForbiddenException, UnprocessableEntityException,
} from '@nestjs/common';
import { CohortsService } from './cohorts.service';

const NOW = new Date('2026-07-03T12:00:00Z');
const YESTERDAY = new Date('2026-07-02T12:00:00Z');
const TOMORROW = new Date('2026-07-04T12:00:00Z');
const NEXT_WEEK = new Date('2026-07-10T12:00:00Z');

const baseCohort = {
  id: 'cohort-1',
  courseId: 'course-1',
  name: 'Turma Julho',
  enrollmentStart: YESTERDAY,
  enrollmentEnd: NEXT_WEEK,
  seats: 30,
  closedAt: null as Date | null,
  createdAt: YESTERDAY,
  updatedAt: YESTERDAY,
};

const makeRepo = (overrides: Record<string, unknown> = {}) => ({
  insert: vi.fn().mockImplementation((d) => Promise.resolve({ ...baseCohort, ...d })),
  findById: vi.fn().mockResolvedValue({ ...baseCohort }),
  findByCourse: vi.fn().mockResolvedValue([{ ...baseCohort }]),
  update: vi.fn().mockImplementation((id, d) => Promise.resolve({ ...baseCohort, ...d })),
  findSchedule: vi.fn().mockResolvedValue([]),
  replaceSchedule: vi.fn().mockResolvedValue(undefined),
  findModuleIdsByCourse: vi.fn().mockResolvedValue(['module-1', 'module-2']),
  hasCohortEnrollmentInCourse: vi.fn().mockResolvedValue(false),
  hasBaseEnrollment: vi.fn().mockResolvedValue(false),
  enrollTransaction: vi.fn().mockResolvedValue('ok'),
  findPublicByCourse: vi.fn().mockResolvedValue([]),
  findByStudent: vi.fn().mockResolvedValue([]),
  ...overrides,
});

const makeCoursesRepo = (overrides: Record<string, unknown> = {}) => ({
  findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'user-1' }),
  ...overrides,
});

describe('CohortsService', () => {
  let service: CohortsService;
  let repo: ReturnType<typeof makeRepo>;
  let coursesRepo: ReturnType<typeof makeCoursesRepo>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    repo = makeRepo();
    coursesRepo = makeCoursesRepo();
    service = new CohortsService(repo as never, coursesRepo as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    const dto = {
      name: 'Turma Julho',
      enrollmentStart: YESTERDAY.toISOString(),
      enrollmentEnd: NEXT_WEEK.toISOString(),
      seats: 30,
    };

    it('cria turma e deriva status aberta dentro do período', async () => {
      // Act
      const result = await service.create('course-1', dto, 'user-1', 'instrutor');

      // Assert
      expect(repo.insert).toHaveBeenCalledWith(expect.objectContaining({
        courseId: 'course-1', name: 'Turma Julho', seats: 30,
      }));
      expect(result.status).toBe('aberta');
    });

    it('lança 422 quando início >= fim', async () => {
      await expect(
        service.create('course-1', { ...dto, enrollmentStart: NEXT_WEEK.toISOString(), enrollmentEnd: YESTERDAY.toISOString() }, 'user-1', 'instrutor'),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(repo.insert).not.toHaveBeenCalled();
    });

    it('lança 404 para curso inexistente', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(service.create('course-x', dto, 'user-1', 'instrutor'))
        .rejects.toThrow(NotFoundException);
    });

    it('lança 403 para instrutor que não é dono', async () => {
      await expect(service.create('course-1', dto, 'outro-user', 'instrutor'))
        .rejects.toThrow(ForbiddenException);
    });

    it('admin pode criar em curso de terceiros', async () => {
      const result = await service.create('course-1', dto, 'admin-user', 'admin');
      expect(result.status).toBe('aberta');
    });
  });

  describe('update', () => {
    it('atualiza campos parciais', async () => {
      const result = await service.update('cohort-1', { seats: 50 }, 'user-1', 'instrutor');
      expect(repo.update).toHaveBeenCalledWith('cohort-1', expect.objectContaining({ seats: 50 }));
      expect(result.seats).toBe(50);
    });

    it('lança 422 quando novo início cruza o fim vigente', async () => {
      await expect(
        service.update('cohort-1', { enrollmentStart: new Date('2026-08-01').toISOString() }, 'user-1', 'instrutor'),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('lança 404 para turma inexistente', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('cohort-x', { seats: 10 }, 'user-1', 'instrutor'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('close', () => {
    it('encerra turma aberta setando closedAt', async () => {
      const result = await service.close('cohort-1', 'user-1', 'instrutor');
      expect(repo.update).toHaveBeenCalledWith('cohort-1', expect.objectContaining({ closedAt: NOW }));
      expect(result.status).toBe('encerrada');
    });

    it('é idempotente para turma já encerrada', async () => {
      repo.findById.mockResolvedValue({ ...baseCohort, closedAt: YESTERDAY });

      const result = await service.close('cohort-1', 'user-1', 'instrutor');

      expect(repo.update).not.toHaveBeenCalled();
      expect(result.status).toBe('encerrada');
    });
  });

  describe('setSchedule', () => {
    it('substitui o cronograma com módulos do curso', async () => {
      const entries = [
        { moduleId: 'module-1', availableFrom: TOMORROW.toISOString() },
        { moduleId: 'module-2', availableFrom: NEXT_WEEK.toISOString() },
      ];

      await service.setSchedule('cohort-1', entries, 'user-1', 'instrutor');

      expect(repo.replaceSchedule).toHaveBeenCalledWith('cohort-1', [
        { moduleId: 'module-1', availableFrom: TOMORROW },
        { moduleId: 'module-2', availableFrom: NEXT_WEEK },
      ]);
    });

    it('lança 422 para módulo que não pertence ao curso', async () => {
      await expect(
        service.setSchedule('cohort-1', [{ moduleId: 'module-alheio', availableFrom: TOMORROW.toISOString() }], 'user-1', 'instrutor'),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(repo.replaceSchedule).not.toHaveBeenCalled();
    });

    it('lança 403 para não-dono', async () => {
      await expect(
        service.setSchedule('cohort-1', [], 'outro-user', 'instrutor'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('enrollStudent (US-23)', () => {
    it('inscreve aluno em turma aberta e cria matrícula base', async () => {
      // Act
      const result = await service.enrollStudent('cohort-1', 'student-1');

      // Assert
      expect(repo.enrollTransaction).toHaveBeenCalledWith('cohort-1', 'student-1', 'course-1', 30);
      expect(result.status).toBe('aberta');
    });

    it('lança 422 fora do período de inscrições', async () => {
      repo.findById.mockResolvedValue({ ...baseCohort, enrollmentStart: TOMORROW, enrollmentEnd: NEXT_WEEK });
      await expect(service.enrollStudent('cohort-1', 'student-1'))
        .rejects.toThrow(UnprocessableEntityException);
      expect(repo.enrollTransaction).not.toHaveBeenCalled();
    });

    it('lança 422 para turma encerrada manualmente', async () => {
      repo.findById.mockResolvedValue({ ...baseCohort, closedAt: YESTERDAY });
      await expect(service.enrollStudent('cohort-1', 'student-1'))
        .rejects.toThrow(UnprocessableEntityException);
    });

    it('lança 409 quando turma está esgotada', async () => {
      repo.enrollTransaction.mockResolvedValue('full');
      const { ConflictException } = await import('@nestjs/common');
      await expect(service.enrollStudent('cohort-1', 'student-1'))
        .rejects.toThrow(ConflictException);
    });

    it('lança 409 se já está em turma do mesmo curso', async () => {
      repo.hasCohortEnrollmentInCourse.mockResolvedValue(true);
      const { ConflictException } = await import('@nestjs/common');
      await expect(service.enrollStudent('cohort-1', 'student-1'))
        .rejects.toThrow(ConflictException);
      expect(repo.enrollTransaction).not.toHaveBeenCalled();
    });

    it('lança 409 se já tem matrícula on demand no curso', async () => {
      repo.hasBaseEnrollment.mockResolvedValue(true);
      const { ConflictException } = await import('@nestjs/common');
      await expect(service.enrollStudent('cohort-1', 'student-1'))
        .rejects.toThrow(ConflictException);
      expect(repo.enrollTransaction).not.toHaveBeenCalled();
    });
  });

  describe('listPublic (US-23)', () => {
    it('deriva esgotada e seatsLeft; exclui encerradas', async () => {
      // Arrange
      repo.findPublicByCourse.mockResolvedValue([
        { ...baseCohort, id: 'c-aberta', enrolledCount: 10 },
        { ...baseCohort, id: 'c-cheia', seats: 10, enrolledCount: 10 },
        { ...baseCohort, id: 'c-agendada', enrollmentStart: TOMORROW, enrollmentEnd: NEXT_WEEK, enrolledCount: 0 },
        { ...baseCohort, id: 'c-fechada', closedAt: YESTERDAY, enrolledCount: 3 },
      ]);

      // Act
      const result = await service.listPublic('course-1');

      // Assert
      expect(result.map((c: { id: string }) => c.id)).toEqual(['c-aberta', 'c-cheia', 'c-agendada']);
      expect(result[0]).toMatchObject({ status: 'aberta', seatsLeft: 20 });
      expect(result[1]).toMatchObject({ status: 'esgotada', seatsLeft: 0 });
      expect(result[2]).toMatchObject({ status: 'agendada' });
    });
  });

  describe('myCohorts (US-23)', () => {
    it('retorna turmas do aluno com curso e cronograma', async () => {
      repo.findByStudent.mockResolvedValue([
        { ...baseCohort, course: { title: 'Curso A', slug: 'curso-a' }, schedule: [] },
      ]);

      const result = await service.myCohorts('student-1');

      expect(repo.findByStudent).toHaveBeenCalledWith('student-1');
      expect(result[0].status).toBe('aberta');
      expect(result[0].course.slug).toBe('curso-a');
    });
  });

  describe('statusOf', () => {
    it('encerrada quando closedAt setado', () => {
      expect(service.statusOf({ ...baseCohort, closedAt: YESTERDAY })).toBe('encerrada');
    });

    it('agendada antes do início das inscrições', () => {
      expect(service.statusOf({ ...baseCohort, enrollmentStart: TOMORROW, enrollmentEnd: NEXT_WEEK })).toBe('agendada');
    });

    it('aberta dentro do período', () => {
      expect(service.statusOf({ ...baseCohort })).toBe('aberta');
    });

    it('encerrada após o fim do período', () => {
      expect(service.statusOf({
        ...baseCohort,
        enrollmentStart: new Date('2026-06-01'),
        enrollmentEnd: YESTERDAY,
      })).toBe('encerrada');
    });
  });
});
