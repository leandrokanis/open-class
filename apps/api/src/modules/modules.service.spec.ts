import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnprocessableEntityException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ModulesService } from './modules.service';

const makeRepo = (overrides = {}) => ({
  findByCourse: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  nextPosition: vi.fn().mockResolvedValue(1),
  updatePosition: vi.fn().mockResolvedValue(undefined),
  findAllIdsByCourse: vi.fn().mockResolvedValue([]),
  courseSummary: vi.fn().mockResolvedValue([]),
  ...overrides,
});

const makeCourseRepo = (overrides = {}) => ({
  findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'user-1' }),
  ...overrides,
});

describe('ModulesService', () => {
  let service: ModulesService;

  beforeEach(() => {
    service = new ModulesService(makeRepo() as never, makeCourseRepo() as never);
  });

  describe('create', () => {
    it('inserts module with next position for course owner', async () => {
      const repo = makeRepo({ nextPosition: vi.fn().mockResolvedValue(3) });
      service = new ModulesService(repo as never, makeCourseRepo() as never);

      await service.create('course-1', { title: 'Intro' } as never, 'user-1', 'instructor');

      expect(repo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 'course-1', position: 3, title: 'Intro' }),
      );
    });

    it('throws ForbiddenException for non-owner instructor', async () => {
      const courseRepo = makeCourseRepo({
        findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'other' }),
      });
      service = new ModulesService(makeRepo() as never, courseRepo as never);

      await expect(
        service.create('course-1', { title: 'x' } as never, 'user-1', 'instructor'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to create module in any course', async () => {
      const courseRepo = makeCourseRepo({
        findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'other' }),
      });
      const repo = makeRepo({ nextPosition: vi.fn().mockResolvedValue(1) });
      service = new ModulesService(repo as never, courseRepo as never);

      await service.create('course-1', { title: 'Admin Module' } as never, 'admin-id', 'admin');
      expect(repo.insert).toHaveBeenCalled();
    });
  });

  describe('findByCourse', () => {
    it('returns modules with lessonsCount and totalDurationSeconds', async () => {
      const repo = makeRepo({
        findByCourse: vi.fn().mockResolvedValue([
          { id: 'mod-1', title: 'Module 1', position: 1 },
          { id: 'mod-2', title: 'Module 2', position: 2 },
        ]),
        courseSummary: vi.fn().mockResolvedValue([
          { moduleId: 'mod-1', lessonsCount: 3, totalDurationSeconds: 600 },
        ]),
      });
      service = new ModulesService(repo as never, makeCourseRepo() as never);

      const result = await service.findByCourse('course-1');
      expect(result[0].lessonsCount).toBe(3);
      expect(result[0].totalDurationSeconds).toBe(600);
      expect(result[1].lessonsCount).toBe(0);
      expect(result[1].totalDurationSeconds).toBe(0);
    });

    it('returns empty array when course has no modules', async () => {
      const repo = makeRepo({
        findByCourse: vi.fn().mockResolvedValue([]),
        courseSummary: vi.fn().mockResolvedValue([]),
      });
      service = new ModulesService(repo as never, makeCourseRepo() as never);

      expect(await service.findByCourse('course-1')).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates module for owner', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ id: 'mod-1', courseId: 'course-1' }),
        update: vi.fn().mockResolvedValue({ id: 'mod-1', title: 'New' }),
      });
      service = new ModulesService(repo as never, makeCourseRepo() as never);

      const result = await service.update('mod-1', { title: 'New' } as never, 'user-1', 'instructor');
      expect(repo.update).toHaveBeenCalledWith('mod-1', { title: 'New' });
      expect(result).toMatchObject({ title: 'New' });
    });

    it('throws NotFoundException when module not found', async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      service = new ModulesService(repo as never, makeCourseRepo() as never);

      await expect(service.update('unk', {} as never, 'user-1', 'instructor')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes module for owner', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ id: 'mod-1', courseId: 'course-1' }),
        delete: vi.fn().mockResolvedValue(undefined),
      });
      service = new ModulesService(repo as never, makeCourseRepo() as never);

      await service.delete('mod-1', 'user-1', 'instructor');
      expect(repo.delete).toHaveBeenCalledWith('mod-1');
    });

    it('throws NotFoundException when module not found', async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      service = new ModulesService(repo as never, makeCourseRepo() as never);

      await expect(service.delete('unk', 'user-1', 'instructor')).rejects.toThrow(NotFoundException);
    });
  });
});

describe('ModulesService.reorder', () => {
  let service: ModulesService;

  beforeEach(() => {
    service = new ModulesService(makeRepo() as never, makeCourseRepo() as never);
  });

  it('reordena com IDs válidos', async () => {
    const ids = ['mod-1', 'mod-2', 'mod-3'];
    const repo = makeRepo({ findAllIdsByCourse: vi.fn().mockResolvedValue([...ids]) });
    const courseRepo = makeCourseRepo();
    service = new ModulesService(repo as never, courseRepo as never);

    const result = await service.reorder('course-1', ids, 'user-1', 'instructor');
    expect(result).toEqual({ reordered: 3 });
    expect(repo.updatePosition).toHaveBeenCalledTimes(3);
  });

  it('lança 422 quando IDs extras são enviados', async () => {
    const repo = makeRepo({ findAllIdsByCourse: vi.fn().mockResolvedValue(['mod-1', 'mod-2']) });
    service = new ModulesService(repo as never, makeCourseRepo() as never);

    await expect(
      service.reorder('course-1', ['mod-1', 'mod-2', 'mod-extra'], 'user-1', 'instructor'),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('lança 422 quando IDs faltam', async () => {
    const repo = makeRepo({ findAllIdsByCourse: vi.fn().mockResolvedValue(['mod-1', 'mod-2', 'mod-3']) });
    service = new ModulesService(repo as never, makeCourseRepo() as never);

    await expect(
      service.reorder('course-1', ['mod-1', 'mod-2'], 'user-1', 'instructor'),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('lança 403 quando instructor não é dono do curso', async () => {
    const courseRepo = makeCourseRepo({
      findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'outro-user' }),
    });
    service = new ModulesService(makeRepo() as never, courseRepo as never);

    await expect(
      service.reorder('course-1', [], 'user-1', 'instructor'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('admin pode reordenar qualquer curso', async () => {
    const ids = ['mod-1'];
    const repo = makeRepo({ findAllIdsByCourse: vi.fn().mockResolvedValue([...ids]) });
    const courseRepo = makeCourseRepo({
      findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'outro-user' }),
    });
    service = new ModulesService(repo as never, courseRepo as never);

    const result = await service.reorder('course-1', ids, 'admin-id', 'admin');
    expect(result.reordered).toBe(1);
  });

  it('lança 404 quando curso não existe', async () => {
    const courseRepo = makeCourseRepo({ findById: vi.fn().mockResolvedValue(null) });
    service = new ModulesService(makeRepo() as never, courseRepo as never);

    await expect(
      service.reorder('curso-inexistente', [], 'user-1', 'instructor'),
    ).rejects.toThrow(NotFoundException);
  });
});
