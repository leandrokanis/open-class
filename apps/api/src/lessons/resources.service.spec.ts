import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ResourcesService } from './resources.service';

const makeRepo = (overrides = {}) => ({
  findById: vi.fn().mockResolvedValue({ id: 'res-1', lessonId: 'lesson-1' }),
  insert: vi.fn().mockImplementation((d) => Promise.resolve({ id: 'res-1', ...d })),
  update: vi.fn().mockImplementation((id, d) => Promise.resolve({ id, ...d })),
  delete: vi.fn().mockResolvedValue(undefined),
  nextPosition: vi.fn().mockResolvedValue(1),
  ...overrides,
});

const makeLessonsService = (overrides = {}) => ({
  assertLessonOwnership: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('ResourcesService', () => {
  let service: ResourcesService;
  let repo: ReturnType<typeof makeRepo>;
  let lessonsService: ReturnType<typeof makeLessonsService>;

  beforeEach(() => {
    repo = makeRepo();
    lessonsService = makeLessonsService();
    service = new ResourcesService(repo as never, lessonsService as never);
  });

  describe('create', () => {
    it('inserts resource after asserting lesson ownership', async () => {
      const result = await service.create(
        'lesson-1',
        { title: 'Slides', url: 'https://slides.com' },
        'user-1',
        'instrutor',
      );

      expect(lessonsService.assertLessonOwnership).toHaveBeenCalledWith(
        'lesson-1', 'user-1', 'instrutor',
      );
      expect(repo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ lessonId: 'lesson-1', title: 'Slides', position: 1 }),
      );
      expect(result.id).toBe('res-1');
    });

    it('propagates ForbiddenException from assertLessonOwnership', async () => {
      const { ForbiddenException } = await import('@nestjs/common');
      lessonsService.assertLessonOwnership.mockRejectedValue(new ForbiddenException());

      await expect(
        service.create('lesson-1', { title: 'x', url: 'x' }, 'other', 'instrutor'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('updates resource when it belongs to the lesson', async () => {
      const result = await service.update(
        'res-1', 'lesson-1', { title: 'New Title' }, 'user-1', 'instrutor',
      );

      expect(repo.update).toHaveBeenCalledWith('res-1', { title: 'New Title', url: undefined });
      expect(result.title).toBe('New Title');
    });

    it('throws NotFoundException when resource not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.update('missing', 'lesson-1', {}, 'user-1', 'instrutor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when resource belongs to different lesson', async () => {
      repo.findById.mockResolvedValue({ id: 'res-1', lessonId: 'other-lesson' });
      await expect(
        service.update('res-1', 'lesson-1', {}, 'user-1', 'instrutor'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes resource after ownership check', async () => {
      await service.delete('res-1', 'lesson-1', 'user-1', 'instrutor');

      expect(lessonsService.assertLessonOwnership).toHaveBeenCalled();
      expect(repo.delete).toHaveBeenCalledWith('res-1');
    });

    it('throws NotFoundException when resource not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.delete('missing', 'lesson-1', 'user-1', 'instrutor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when resource belongs to different lesson', async () => {
      repo.findById.mockResolvedValue({ id: 'res-1', lessonId: 'other-lesson' });
      await expect(
        service.delete('res-1', 'lesson-1', 'user-1', 'instrutor'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
