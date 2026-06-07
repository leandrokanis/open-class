import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException } from '@nestjs/common';

vi.mock('./enrollments.repository');
vi.mock('../progress/progress.repository');
vi.mock('../mail/mail.service');

import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsRepository } from './enrollments.repository';
import { ProgressRepository } from '../progress/progress.repository';
import { MailService } from '../mail/mail.service';

const makeRepo = () => ({
  findByStudent: vi.fn(),
  create: vi.fn(),
  findCourseBasicById: vi.fn(),
  findStudentEmailById: vi.fn(),
});

const makeProgressRepo = () => ({
  getCompletionStats: vi.fn(),
  getLastAccessedLesson: vi.fn(),
});

const makeMail = () => ({
  sendEnrollmentWelcome: vi.fn().mockResolvedValue(undefined),
});

const fakeEnrollment = {
  id: 'enroll-1',
  status: 'active' as const,
  enrolledAt: new Date('2026-05-01'),
  course: {
    id: 'course-1',
    title: 'JavaScript do Zero ao Avançado',
    slug: 'javascript-do-zero',
    level: 'intermediate',
    thumbnailUrl: null,
    totalDurationMinutes: 1960,
    category: { id: 'cat-1', name: 'Dev Web', slug: 'dev-web' },
    instructor: { name: 'Carlos Mendes' },
  },
};

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let repo: ReturnType<typeof makeRepo>;
  let progressRepo: ReturnType<typeof makeProgressRepo>;
  let mail: ReturnType<typeof makeMail>;

  beforeEach(() => {
    repo = makeRepo();
    progressRepo = makeProgressRepo();
    mail = makeMail();
    service = new EnrollmentsService(
      repo as unknown as EnrollmentsRepository,
      progressRepo as unknown as ProgressRepository,
      mail as unknown as MailService,
    );
  });

  describe('enroll()', () => {
    it('cria matrícula e dispara e-mail de boas-vindas', async () => {
      const fakeRow = { id: 'enroll-new', studentId: 'student-1', courseId: 'course-1', status: 'active', enrolledAt: new Date() };
      repo.create.mockResolvedValue(fakeRow);
      repo.findStudentEmailById.mockResolvedValue('aluno@example.com');
      repo.findCourseBasicById.mockResolvedValue({ title: 'Curso de NestJS', slug: 'nestjs' });

      const result = await service.enroll('student-1', 'course-1');

      expect(result).toBe(fakeRow);
      await vi.waitFor(() => expect(mail.sendEnrollmentWelcome).toHaveBeenCalledOnce());
      expect(mail.sendEnrollmentWelcome).toHaveBeenCalledWith(
        'aluno@example.com',
        'Curso de NestJS',
        expect.stringContaining('/courses/nestjs'),
      );
    });

    it('não chama sendEnrollmentWelcome quando aluno já está matriculado', async () => {
      repo.create.mockResolvedValue(null);

      await expect(service.enroll('student-1', 'course-1')).rejects.toBeInstanceOf(ConflictException);
      expect(mail.sendEnrollmentWelcome).not.toHaveBeenCalled();
    });

    it('não propaga erro de e-mail — matrícula retorna normalmente', async () => {
      const fakeRow = { id: 'enroll-new', studentId: 'student-1', courseId: 'course-1', status: 'active', enrolledAt: new Date() };
      repo.create.mockResolvedValue(fakeRow);
      repo.findStudentEmailById.mockResolvedValue('aluno@example.com');
      repo.findCourseBasicById.mockResolvedValue({ title: 'Curso de NestJS', slug: 'nestjs' });
      mail.sendEnrollmentWelcome.mockRejectedValue(new Error('SMTP down'));

      const result = await service.enroll('student-1', 'course-1');

      expect(result).toBe(fakeRow);
    });
  });

  describe('findByStudent()', () => {
    it('retorna array vazio quando aluno não tem matrículas', async () => {
      repo.findByStudent.mockResolvedValue([]);

      const result = await service.findByStudent('student-x');

      expect(result).toEqual([]);
    });

    it('retorna matrículas enriquecidas com progresso e última aula', async () => {
      repo.findByStudent.mockResolvedValue([fakeEnrollment]);
      progressRepo.getCompletionStats.mockResolvedValue({ completed: 30, total: 48 });
      progressRepo.getLastAccessedLesson.mockResolvedValue({
        id: 'lesson-1',
        title: 'Funções e Escopo',
        moduleId: 'mod-1',
        position: 5,
        updatedAt: new Date(),
      });

      const result = await service.findByStudent('student-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('enroll-1');
      expect(result[0].progress).toEqual({ completedLessons: 30, totalLessons: 48, percentage: 62.5 });
      expect(result[0].lastLesson).toEqual({ id: 'lesson-1', title: 'Funções e Escopo' });
    });

    it('define lastLesson como null quando nenhuma aula foi acessada', async () => {
      repo.findByStudent.mockResolvedValue([fakeEnrollment]);
      progressRepo.getCompletionStats.mockResolvedValue({ completed: 0, total: 10 });
      progressRepo.getLastAccessedLesson.mockResolvedValue(null);

      const result = await service.findByStudent('student-1');

      expect(result[0].lastLesson).toBeNull();
    });

    it('filtra matrículas com status cancelled', async () => {
      const cancelledEnrollment = { ...fakeEnrollment, status: 'cancelled' as const };
      repo.findByStudent.mockResolvedValue([cancelledEnrollment]);

      const result = await service.findByStudent('student-1');

      expect(result).toHaveLength(0);
    });

    it('calcula percentage corretamente com total zero', async () => {
      repo.findByStudent.mockResolvedValue([fakeEnrollment]);
      progressRepo.getCompletionStats.mockResolvedValue({ completed: 0, total: 0 });
      progressRepo.getLastAccessedLesson.mockResolvedValue(null);

      const result = await service.findByStudent('student-1');

      expect(result[0].progress.percentage).toBe(0);
    });
  });
});
