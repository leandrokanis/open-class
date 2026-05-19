import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnrollmentsService } from './enrollments.service';

const makeRepo = (overrides: Record<string, unknown> = {}) => ({
  findByStudent: vi.fn(),
  ...overrides,
});

const makeProgressRepo = (overrides: Record<string, unknown> = {}) => ({
  getCompletionStats: vi.fn(),
  getLastAccessedLesson: vi.fn(),
  ...overrides,
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

  beforeEach(() => {
    repo = makeRepo();
    progressRepo = makeProgressRepo();
    service = new EnrollmentsService(repo as never, progressRepo as never);
  });

  describe('findByStudent', () => {
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
