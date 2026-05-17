import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue({ id: 'cat-1', name: 'Web', slug: 'web', position: 1 }),
  findByName: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockImplementation((d) => Promise.resolve({ id: 'cat-1', ...d })),
  update: vi.fn().mockImplementation((id, d) => Promise.resolve({ id, ...d })),
  delete: vi.fn().mockResolvedValue(undefined),
  slugExists: vi.fn().mockResolvedValue(false),
  maxPosition: vi.fn().mockResolvedValue(0),
  countLinkedCourses: vi.fn().mockResolvedValue(0),
  reorder: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new CategoriesService(repo as never);
  });

  describe('findOne', () => {
    it('returns category when found', async () => {
      const result = await service.findOne('cat-1');
      expect(result.id).toBe('cat-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates category with auto-generated slug and next position', async () => {
      repo.maxPosition.mockResolvedValue(2);
      await service.create({ name: 'Mobile Dev' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mobile Dev', slug: 'mobile-dev', position: 3 }),
      );
    });

    it('sets position to 1 for first category', async () => {
      repo.maxPosition.mockResolvedValue(0);
      await service.create({ name: 'First' });

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ position: 1 }));
    });

    it('throws ConflictException for duplicate name', async () => {
      repo.findByName.mockResolvedValue({ id: 'existing' });
      await expect(service.create({ name: 'Web' })).rejects.toThrow(ConflictException);
    });

    it('appends suffix to slug when base slug is taken', async () => {
      repo.slugExists
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await service.create({ name: 'Web' });

      const saved = repo.create.mock.calls[0][0];
      expect(saved.slug).toBe('web-1');
    });
  });

  describe('update', () => {
    it('updates name and auto-generates new slug', async () => {
      await service.update('cat-1', { name: 'Mobile' });

      expect(repo.update).toHaveBeenCalledWith(
        'cat-1',
        expect.objectContaining({ name: 'Mobile', slug: 'mobile' }),
      );
    });

    it('does not change slug when name is unchanged', async () => {
      await service.update('cat-1', { name: 'Web' });

      expect(repo.update).not.toHaveBeenCalledWith(
        'cat-1',
        expect.objectContaining({ slug: expect.anything() }),
      );
    });

    it('throws ConflictException when new name already taken by another category', async () => {
      repo.findByName.mockResolvedValue({ id: 'other-cat' });
      await expect(service.update('cat-1', { name: 'Taken' })).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when category not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('missing', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes category with no linked courses', async () => {
      await service.remove('cat-1');
      expect(repo.delete).toHaveBeenCalledWith('cat-1');
    });

    it('throws ConflictException when category has linked courses', async () => {
      repo.countLinkedCourses.mockResolvedValue(3);
      await expect(service.remove('cat-1')).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when category not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('delegates to repository', async () => {
      await service.reorder(['cat-2', 'cat-1']);
      expect(repo.reorder).toHaveBeenCalledWith(['cat-2', 'cat-1']);
    });
  });
});
