import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProgressService } from './progress.service';

const now = new Date('2026-05-17T10:00:00Z');

const makeRepo = (overrides: Record<string, unknown> = {}) => ({
  findLessonWithCourse: vi.fn().mockResolvedValue({
    id:       'lesson-1',
    title:    'Aula 1',
    moduleId: 'module-1',
    module:   { id: 'module-1', courseId: 'course-1' },
  }),
  isEnrolled: vi.fn().mockResolvedValue(true),
  upsertProgress: vi.fn().mockResolvedValue({
    lessonId:    'lesson-1',
    isCompleted: true,
    completedAt: now,
    updatedAt:   now,
  }),
  getCompletionStats: vi.fn().mockResolvedValue({ completed: 2, total: 4 }),
  getCompletedLessonIds: vi.fn().mockResolvedValue(['lesson-1', 'lesson-2']),
  getLastAccessedLesson: vi.fn().mockResolvedValue({
    id:        'lesson-1',
    title:     'Aula 1',
    moduleId:  'module-1',
    position:  1,
    updatedAt: now,
  }),
  findCourseById: vi.fn().mockResolvedValue({ id: 'course-1', title: 'Curso 1' }),
  ...overrides,
});

describe('ProgressService', () => {
  let service: ProgressService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new ProgressService(repo as never);
  });

  // ── markLesson ─────────────────────────────────────────────────────────

  describe('markLesson', () => {
    it('lança NotFoundException quando aula não existe', async () => {
      repo.findLessonWithCourse.mockResolvedValue(null);
      await expect(service.markLesson('student-1', 'lesson-x', true))
        .rejects.toThrow(NotFoundException);
    });

    it('lança ForbiddenException quando aluno não está matriculado', async () => {
      repo.isEnrolled.mockResolvedValue(false);
      await expect(service.markLesson('student-1', 'lesson-1', true))
        .rejects.toThrow(ForbiddenException);
    });

    it('retorna progresso com completedAt quando marcando como concluída', async () => {
      const result = await service.markLesson('student-1', 'lesson-1', true);
      expect(result.isCompleted).toBe(true);
      expect(result.completedAt).toEqual(now);
      expect(repo.upsertProgress).toHaveBeenCalledWith('student-1', 'lesson-1', true);
    });

    it('retorna progresso com completedAt null quando desmarcando', async () => {
      repo.upsertProgress.mockResolvedValue({
        lessonId:    'lesson-1',
        isCompleted: false,
        completedAt: null,
        updatedAt:   now,
      });
      const result = await service.markLesson('student-1', 'lesson-1', false);
      expect(result.isCompleted).toBe(false);
      expect(result.completedAt).toBeNull();
    });
  });

  // ── getCourseProgress ──────────────────────────────────────────────────

  describe('getCourseProgress', () => {
    it('lança NotFoundException quando curso não existe', async () => {
      repo.findCourseById.mockResolvedValue(null);
      await expect(service.getCourseProgress('student-1', 'course-x'))
        .rejects.toThrow(NotFoundException);
    });

    it('lança ForbiddenException quando aluno não está matriculado', async () => {
      repo.isEnrolled.mockResolvedValue(false);
      await expect(service.getCourseProgress('student-1', 'course-1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('retorna 0.0% quando curso não tem aulas visíveis', async () => {
      repo.getCompletionStats.mockResolvedValue({ completed: 0, total: 0 });
      const result = await service.getCourseProgress('student-1', 'course-1');
      expect(result.percentage).toBe(0);
      expect(result.totalLessons).toBe(0);
    });

    it('calcula percentual corretamente com conclusão parcial', async () => {
      repo.getCompletionStats.mockResolvedValue({ completed: 2, total: 4 });
      const result = await service.getCourseProgress('student-1', 'course-1');
      expect(result.percentage).toBe(50);
      expect(result.completedLessons).toBe(2);
      expect(result.totalLessons).toBe(4);
    });

    it('retorna 100.0% quando todas as aulas estão concluídas', async () => {
      repo.getCompletionStats.mockResolvedValue({ completed: 4, total: 4 });
      const result = await service.getCourseProgress('student-1', 'course-1');
      expect(result.percentage).toBe(100);
    });
  });

  // ── getLastAccessed ────────────────────────────────────────────────────

  describe('getLastAccessed', () => {
    it('lança NotFoundException quando curso não existe', async () => {
      repo.findCourseById.mockResolvedValue(null);
      await expect(service.getLastAccessed('student-1', 'course-x'))
        .rejects.toThrow(NotFoundException);
    });

    it('lança ForbiddenException quando aluno não está matriculado', async () => {
      repo.isEnrolled.mockResolvedValue(false);
      await expect(service.getLastAccessed('student-1', 'course-1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('retorna lastAccessedLesson null quando não há progresso', async () => {
      repo.getLastAccessedLesson.mockResolvedValue(null);
      const result = await service.getLastAccessed('student-1', 'course-1');
      expect(result.lastAccessedLesson).toBeNull();
    });

    it('retorna a aula com updatedAt mais recente', async () => {
      const result = await service.getLastAccessed('student-1', 'course-1');
      expect(result.lastAccessedLesson).not.toBeNull();
      expect(result.lastAccessedLesson?.id).toBe('lesson-1');
      expect(result.lastAccessedLesson?.updatedAt).toEqual(now);
    });
  });

  // ── getCompletedLessonIds ──────────────────────────────────────────────

  describe('getCompletedLessonIds', () => {
    it('retorna array com IDs das aulas concluídas', async () => {
      repo.getCompletedLessonIds.mockResolvedValue(['lesson-1', 'lesson-2']);
      const result = await service.getCompletedLessonIds('student-1', 'course-1');
      expect(result).toEqual(['lesson-1', 'lesson-2']);
      expect(repo.getCompletedLessonIds).toHaveBeenCalledWith('student-1', 'course-1');
    });

    it('retorna array vazio quando aluno não concluiu nenhuma aula', async () => {
      repo.getCompletedLessonIds.mockResolvedValue([]);
      const result = await service.getCompletedLessonIds('student-1', 'course-1');
      expect(result).toEqual([]);
    });

    it('lança ForbiddenException quando aluno não está matriculado', async () => {
      repo.isEnrolled.mockResolvedValue(false);
      await expect(service.getCompletedLessonIds('student-1', 'course-1'))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
