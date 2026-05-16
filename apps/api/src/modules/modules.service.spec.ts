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
