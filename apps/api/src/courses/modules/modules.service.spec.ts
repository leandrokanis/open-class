import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NotFoundException, ForbiddenException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { ModulesService } from './modules.service';

const makeRepo = (overrides = {}) => ({
  findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'user-1' }),
  findModuleById: vi.fn().mockResolvedValue({ id: 'mod-1', courseId: 'course-1' }),
  createModule: vi.fn().mockResolvedValue({ id: 'mod-1' }),
  updateModule: vi.fn().mockResolvedValue({ id: 'mod-1', title: 'Updated' }),
  deleteModule: vi.fn().mockResolvedValue(undefined),
  countLessonsInModule: vi.fn().mockResolvedValue(0),
  countModulesInCourse: vi.fn().mockResolvedValue(2),
  reorderModules: vi.fn().mockResolvedValue(undefined),
  setModuleVisibility: vi.fn().mockResolvedValue({ id: 'mod-1', visibility: 'hidden' }),
  ...overrides,
});

const user = { id: 'user-1', role: 'instructor' };

describe('ModulesService (courses/)', () => {
  let service: ModulesService;

  beforeEach(() => {
    service = new ModulesService(makeRepo() as never);
  });

  describe('create', () => {
    it('creates module for course owner', async () => {
      const repo = makeRepo();
      service = new ModulesService(repo as never);

      await service.create('course-1', user, { title: 'Intro' } as never);
      expect(repo.createModule).toHaveBeenCalledWith(expect.objectContaining({ courseId: 'course-1', title: 'Intro' }));
    });

    it('throws NotFoundException when course not found', async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      service = new ModulesService(repo as never);

      await expect(service.create('none', user, { title: 'x' } as never)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for non-owner', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'other' }),
      });
      service = new ModulesService(repo as never);

      await expect(service.create('course-1', user, { title: 'x' } as never)).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to create module in any course', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'other' }),
      });
      service = new ModulesService(repo as never);

      await service.create('course-1', { id: 'admin-1', role: 'admin' }, { title: 'x' } as never);
      expect(repo.createModule).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates module for owner', async () => {
      const repo = makeRepo();
      service = new ModulesService(repo as never);

      const result = await service.update('course-1', 'mod-1', user, { title: 'Updated' } as never);
      expect(repo.updateModule).toHaveBeenCalledWith('mod-1', { title: 'Updated' });
      expect(result).toMatchObject({ title: 'Updated' });
    });

    it('throws NotFoundException when module not found', async () => {
      const repo = makeRepo({ findModuleById: vi.fn().mockResolvedValue(null) });
      service = new ModulesService(repo as never);

      await expect(service.update('course-1', 'mod-x', user, {} as never)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not course owner', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'other' }),
      });
      service = new ModulesService(repo as never);

      await expect(service.update('course-1', 'mod-1', user, {} as never)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deletes module with no lessons', async () => {
      const repo = makeRepo();
      service = new ModulesService(repo as never);

      await service.remove('course-1', 'mod-1', user, false);
      expect(repo.deleteModule).toHaveBeenCalledWith('mod-1');
    });

    it('throws ConflictException when module has lessons without force', async () => {
      const repo = makeRepo({ countLessonsInModule: vi.fn().mockResolvedValue(3) });
      service = new ModulesService(repo as never);

      await expect(service.remove('course-1', 'mod-1', user, false)).rejects.toThrow(ConflictException);
    });

    it('force-deletes module that has lessons', async () => {
      const repo = makeRepo({ countLessonsInModule: vi.fn().mockResolvedValue(3) });
      service = new ModulesService(repo as never);

      await service.remove('course-1', 'mod-1', user, true);
      expect(repo.deleteModule).toHaveBeenCalledWith('mod-1');
    });

    it('throws NotFoundException when module not found', async () => {
      const repo = makeRepo({ findModuleById: vi.fn().mockResolvedValue(null) });
      service = new ModulesService(repo as never);

      await expect(service.remove('course-1', 'mod-x', user, false)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('reorders all modules', async () => {
      const ids = ['mod-1', 'mod-2'];
      const repo = makeRepo({ countModulesInCourse: vi.fn().mockResolvedValue(2) });
      service = new ModulesService(repo as never);

      const result = await service.reorder('course-1', user, ids);
      expect(result).toEqual({ reordered: 2 });
      expect(repo.reorderModules).toHaveBeenCalledWith('course-1', ids);
    });

    it('throws BadRequestException when ID count does not match', async () => {
      const repo = makeRepo({ countModulesInCourse: vi.fn().mockResolvedValue(3) });
      service = new ModulesService(repo as never);

      await expect(service.reorder('course-1', user, ['mod-1', 'mod-2'])).rejects.toThrow(BadRequestException);
    });
  });

  describe('setVisibility', () => {
    it('delegates to repository', async () => {
      const repo = makeRepo();
      service = new ModulesService(repo as never);

      const result = await service.setVisibility('course-1', 'mod-1', user, 'hidden');
      expect(repo.setModuleVisibility).toHaveBeenCalledWith('mod-1', 'hidden');
      expect(result).toMatchObject({ visibility: 'hidden' });
    });
  });
});
