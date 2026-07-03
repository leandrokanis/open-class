import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProgressService } from './progress.service';

const now = new Date('2026-05-17T10:00:00Z');

const makeRepo = (overrides: Record<string, unknown> = {}) => ({
  getRecentActivity: vi.fn().mockResolvedValue([]),
  findLessonWithCourse: vi.fn().mockResolvedValue({
    id:       'lesson-1',
    title:    'Aula 1',
    moduleId: 'module-1',
    isExtra:  false,
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
  hasCompletedAllNormals: vi.fn().mockResolvedValue(false),
  getExtrasStatus: vi.fn().mockResolvedValue([]),
  upsertExtrasCelebration: vi.fn().mockResolvedValue(undefined),
  findModuleCourseId: vi.fn().mockResolvedValue('course-1'),
  findCohortModuleLock: vi.fn().mockResolvedValue(null),
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

  // ── getRecentActivity ──────────────────────────────────────────────────

  describe('getRecentActivity', () => {
    const recentItems = [
      { lessonId: 'l1', lessonTitle: 'Aula 1', courseId: 'c1', courseTitle: 'Curso A', courseSlug: 'curso-a', isCompleted: true, updatedAt: new Date('2026-05-18T10:00:00Z') },
      { lessonId: 'l2', lessonTitle: 'Aula 2', courseId: 'c1', courseTitle: 'Curso A', courseSlug: 'curso-a', isCompleted: true, updatedAt: new Date('2026-05-17T20:00:00Z') },
    ];

    it('retorna array vazio quando não há atividade', async () => {
      repo.getRecentActivity.mockResolvedValue([]);
      const result = await service.getRecentActivity('student-1', 5);
      expect(result).toEqual([]);
    });

    it('retorna itens de atividade recente do repository', async () => {
      repo.getRecentActivity.mockResolvedValue(recentItems);
      const result = await service.getRecentActivity('student-1', 5);
      expect(result).toHaveLength(2);
      expect(result[0].lessonId).toBe('l1');
      expect(result[0].courseSlug).toBe('curso-a');
    });

    it('passa o limit correto para o repository', async () => {
      repo.getRecentActivity.mockResolvedValue([]);
      await service.getRecentActivity('student-1', 3);
      expect(repo.getRecentActivity).toHaveBeenCalledWith('student-1', 3);
    });
  });

  // ── acesso privilegiado: admin e instrutor dono ────────────────────────

  describe('acesso como aluno para admin e instrutor dono', () => {
    beforeEach(() => {
      repo.isEnrolled.mockResolvedValue(false);
      repo.findCourseById.mockResolvedValue({ id: 'course-1', title: 'Curso 1', instructorId: 'prof-1' });
    });

    it('admin não matriculado acessa progresso de qualquer curso', async () => {
      const result = await service.getCourseProgress('admin-1', 'course-1', 'admin');
      expect(result.courseId).toBe('course-1');
    });

    it('instrutor dono não matriculado acessa progresso do próprio curso', async () => {
      const result = await service.getCourseProgress('prof-1', 'course-1', 'instrutor');
      expect(result.courseId).toBe('course-1');
    });

    it('instrutor que não é dono continua bloqueado', async () => {
      await expect(service.getCourseProgress('prof-2', 'course-1', 'instrutor'))
        .rejects.toThrow(ForbiddenException);
    });

    it('aluno não matriculado continua bloqueado', async () => {
      await expect(service.getCourseProgress('student-1', 'course-1', 'aluno'))
        .rejects.toThrow(ForbiddenException);
    });

    it('admin acessa lista de aulas concluídas sem matrícula', async () => {
      const result = await service.getCompletedLessonIds('admin-1', 'course-1', 'admin');
      expect(result).toEqual(['lesson-1', 'lesson-2']);
    });

    it('admin marca aula sem matrícula', async () => {
      const result = await service.markLesson('admin-1', 'lesson-1', true, 'admin');
      expect(result.lessonId).toBe('lesson-1');
    });

    it('instrutor dono vê status de extras sem matrícula', async () => {
      const result = await service.getExtrasStatus('prof-1', 'course-1', 'instrutor');
      expect(result).toEqual([]);
    });
  });

  // ── aulas extras (US-20) ───────────────────────────────────────────────

  describe('markLesson em aula extra', () => {
    it('lança ForbiddenException para extra ainda bloqueada', async () => {
      // Arrange — aula extra e normais do módulo incompletas
      repo.findLessonWithCourse.mockResolvedValue({
        id: 'lesson-x', title: 'Bônus', moduleId: 'module-1', isExtra: true,
        module: { id: 'module-1', courseId: 'course-1' },
      });
      repo.hasCompletedAllNormals.mockResolvedValue(false);

      // Act + Assert
      await expect(service.markLesson('student-1', 'lesson-x', true))
        .rejects.toThrow(ForbiddenException);
      expect(repo.upsertProgress).not.toHaveBeenCalled();
    });

    it('registra progresso em extra desbloqueada (histórico normal)', async () => {
      // Arrange
      repo.findLessonWithCourse.mockResolvedValue({
        id: 'lesson-x', title: 'Bônus', moduleId: 'module-1', isExtra: true,
        module: { id: 'module-1', courseId: 'course-1' },
      });
      repo.hasCompletedAllNormals.mockResolvedValue(true);
      repo.upsertProgress.mockResolvedValue({
        lessonId: 'lesson-x', isCompleted: true, completedAt: now, updatedAt: now,
      });

      // Act
      const result = await service.markLesson('student-1', 'lesson-x', true);

      // Assert
      expect(result.lessonId).toBe('lesson-x');
      expect(repo.upsertProgress).toHaveBeenCalledWith('student-1', 'lesson-x', true);
    });

    it('aula normal não consulta desbloqueio', async () => {
      await service.markLesson('student-1', 'lesson-1', true);
      expect(repo.hasCompletedAllNormals).not.toHaveBeenCalled();
    });
  });

  describe('markLesson com cronograma de turma (US-24)', () => {
    it('nega marcação em módulo ainda não liberado para aluno de turma', async () => {
      repo.findCohortModuleLock.mockResolvedValue({
        availableFrom: new Date(Date.now() + 86400000),
        cohortClosed: false,
      });

      await expect(service.markLesson('student-1', 'lesson-1', true))
        .rejects.toThrow(ForbiddenException);
      expect(repo.upsertProgress).not.toHaveBeenCalled();
    });

    it('permite marcação em módulo liberado', async () => {
      repo.findCohortModuleLock.mockResolvedValue({
        availableFrom: new Date(Date.now() - 86400000),
        cohortClosed: false,
      });

      const result = await service.markLesson('student-1', 'lesson-1', true);
      expect(result.lessonId).toBe('lesson-1');
    });
  });

  describe('getExtrasStatus', () => {
    it('mapeia módulos para hasExtras/unlocked/celebrated', async () => {
      // Arrange
      repo.getExtrasStatus.mockResolvedValue([
        { moduleId: 'module-1', extrasCount: 2, normalsTotal: 3, normalsCompleted: 3, celebrated: false },
        { moduleId: 'module-2', extrasCount: 0, normalsTotal: 2, normalsCompleted: 1, celebrated: false },
        { moduleId: 'module-3', extrasCount: 1, normalsTotal: 2, normalsCompleted: 1, celebrated: false },
      ]);

      // Act
      const result = await service.getExtrasStatus('student-1', 'course-1');

      // Assert
      expect(result).toEqual([
        { moduleId: 'module-1', hasExtras: true, unlocked: true, celebrated: false },
        { moduleId: 'module-2', hasExtras: false, unlocked: false, celebrated: false },
        { moduleId: 'module-3', hasExtras: true, unlocked: false, celebrated: false },
      ]);
    });

    it('módulo sem aulas normais visíveis conta como desbloqueado (verdade vácua)', async () => {
      repo.getExtrasStatus.mockResolvedValue([
        { moduleId: 'module-1', extrasCount: 1, normalsTotal: 0, normalsCompleted: 0, celebrated: true },
      ]);

      const result = await service.getExtrasStatus('student-1', 'course-1');

      expect(result[0]).toEqual({ moduleId: 'module-1', hasExtras: true, unlocked: true, celebrated: true });
    });

    it('lança Forbidden para aluno não matriculado', async () => {
      repo.isEnrolled.mockResolvedValue(false);
      await expect(service.getExtrasStatus('student-1', 'course-1'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('celebrateExtras', () => {
    it('registra celebração para aluno matriculado', async () => {
      // Act
      const result = await service.celebrateExtras('student-1', 'module-1');

      // Assert
      expect(result).toEqual({ celebrated: true });
      expect(repo.upsertExtrasCelebration).toHaveBeenCalledWith('student-1', 'module-1');
    });

    it('lança NotFound para módulo inexistente', async () => {
      repo.findModuleCourseId.mockResolvedValue(null);
      await expect(service.celebrateExtras('student-1', 'module-x'))
        .rejects.toThrow(NotFoundException);
    });

    it('lança Forbidden para não matriculado', async () => {
      repo.isEnrolled.mockResolvedValue(false);
      await expect(service.celebrateExtras('student-1', 'module-1'))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
