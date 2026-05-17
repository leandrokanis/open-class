import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';

const makeRepo = (overrides = {}) => ({
  findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'user-1' }),
  findModuleById: vi.fn().mockResolvedValue({ id: 'mod-1', courseId: 'course-1' }),
  findLessonById: vi.fn().mockResolvedValue({ id: 'lesson-1', moduleId: 'mod-1' }),
  createLesson: vi.fn().mockResolvedValue({ id: 'lesson-1' }),
  updateLesson: vi.fn().mockResolvedValue({ id: 'lesson-1', title: 'Updated' }),
  deleteLesson: vi.fn().mockResolvedValue(undefined),
  countLessonsInModule: vi.fn().mockResolvedValue(2),
  reorderLessons: vi.fn().mockResolvedValue(undefined),
  setLessonVisibility: vi.fn().mockResolvedValue({ id: 'lesson-1', visibility: 'hidden' }),
  ...overrides,
});

const user = { id: 'user-1', role: 'instructor' };

describe('LessonsService (courses/)', () => {
  let service: LessonsService;

  beforeEach(() => {
    service = new LessonsService(makeRepo() as never);
  });

  describe('create', () => {
    it('creates lesson for course owner', async () => {
      const repo = makeRepo();
      service = new LessonsService(repo as never);

      await service.create('course-1', 'mod-1', user, { title: 'Aula 1' } as never);
      expect(repo.createLesson).toHaveBeenCalledWith(expect.objectContaining({ moduleId: 'mod-1', title: 'Aula 1' }));
    });

    it('throws NotFoundException when course not found', async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      service = new LessonsService(repo as never);

      await expect(service.create('none', 'mod-1', user, { title: 'x' } as never)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for non-owner', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'other' }),
      });
      service = new LessonsService(repo as never);

      await expect(service.create('course-1', 'mod-1', user, { title: 'x' } as never)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when module not found', async () => {
      const repo = makeRepo({ findModuleById: vi.fn().mockResolvedValue(null) });
      service = new LessonsService(repo as never);

      await expect(service.create('course-1', 'mod-x', user, { title: 'x' } as never)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates lesson for owner', async () => {
      const repo = makeRepo();
      service = new LessonsService(repo as never);

      const result = await service.update('course-1', 'mod-1', 'lesson-1', user, { title: 'Updated' } as never);
      expect(repo.updateLesson).toHaveBeenCalledWith('lesson-1', expect.objectContaining({ title: 'Updated' }));
      expect(result).toMatchObject({ title: 'Updated' });
    });

    it('throws NotFoundException when lesson not found', async () => {
      const repo = makeRepo({ findLessonById: vi.fn().mockResolvedValue(null) });
      service = new LessonsService(repo as never);

      await expect(service.update('course-1', 'mod-1', 'unk', user, {} as never)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when lesson belongs to different module', async () => {
      const repo = makeRepo({
        findLessonById: vi.fn().mockResolvedValue({ id: 'lesson-1', moduleId: 'other-mod' }),
      });
      service = new LessonsService(repo as never);

      await expect(service.update('course-1', 'mod-1', 'lesson-1', user, {} as never)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes lesson for owner', async () => {
      const repo = makeRepo();
      service = new LessonsService(repo as never);

      await service.remove('course-1', 'mod-1', 'lesson-1', user);
      expect(repo.deleteLesson).toHaveBeenCalledWith('lesson-1');
    });

    it('throws NotFoundException when lesson not found', async () => {
      const repo = makeRepo({ findLessonById: vi.fn().mockResolvedValue(null) });
      service = new LessonsService(repo as never);

      await expect(service.remove('course-1', 'mod-1', 'unk', user)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('reorders all lessons', async () => {
      const ids = ['lesson-1', 'lesson-2'];
      const repo = makeRepo({ countLessonsInModule: vi.fn().mockResolvedValue(2) });
      service = new LessonsService(repo as never);

      const result = await service.reorder('course-1', 'mod-1', user, ids);
      expect(result).toEqual({ reordered: 2 });
      expect(repo.reorderLessons).toHaveBeenCalledWith('mod-1', ids);
    });

    it('throws BadRequestException when ID count does not match', async () => {
      const repo = makeRepo({ countLessonsInModule: vi.fn().mockResolvedValue(3) });
      service = new LessonsService(repo as never);

      await expect(service.reorder('course-1', 'mod-1', user, ['lesson-1'])).rejects.toThrow(BadRequestException);
    });
  });

  describe('setVisibility', () => {
    it('delegates to repository', async () => {
      const repo = makeRepo();
      service = new LessonsService(repo as never);

      const result = await service.setVisibility('course-1', 'mod-1', 'lesson-1', user, 'hidden');
      expect(repo.setLessonVisibility).toHaveBeenCalledWith('lesson-1', 'hidden');
      expect(result).toMatchObject({ visibility: 'hidden' });
    });
  });
});
