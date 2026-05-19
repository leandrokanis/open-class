import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CatalogService } from './catalog.service';

const makeRow = (overrides = {}) => ({
  id: 'c1',
  title: 'React Basics',
  slug: 'react-basics',
  shortDescription: 'Learn React',
  level: 'beginner',
  thumbnailUrl: null,
  rating: 4.8,
  reviewCount: 1200,
  lessonCount: 36,
  totalDurationMinutes: 120,
  category: null,
  instructor: { name: 'Alice' },
  createdAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

const makeRepo = (overrides = {}) => ({
  findPublished: vi.fn().mockResolvedValue({ rows: [makeRow()], hasMore: false }),
  findBySlug: vi.fn().mockResolvedValue({
    id: 'c1',
    title: 'React Basics',
    slug: 'react-basics',
    shortDescription: null,
    description: null,
    level: 'beginner',
    thumbnailUrl: null,
    category: null,
    instructor: { name: 'Alice' },
    modules: [],
    createdAt: new Date('2026-01-01T00:00:00Z'),
  }),
  findCategories: vi.fn().mockResolvedValue([
    { id: 'cat-1', name: 'Web', slug: 'web', description: null, iconUrl: null },
  ]),
  getStats: vi.fn().mockResolvedValue({ totalCourses: 12, totalInstructors: 6, percentFree: 100 }),
  ...overrides,
});

describe('CatalogService', () => {
  let service: CatalogService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new CatalogService(repo as never);
  });

  describe('listPublished', () => {
    it('returns first page with meta when no cursor given', async () => {
      const result = await service.listPublished({ limit: 5 });

      expect(repo.findPublished).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5, cursor: undefined }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
    });

    it('maps new enrichment fields rating, reviewCount, lessonCount, totalDurationMinutes', async () => {
      const result = await service.listPublished({ limit: 5 });

      expect(result.data[0].rating).toBe(4.8);
      expect(result.data[0].reviewCount).toBe(1200);
      expect(result.data[0].lessonCount).toBe(36);
      expect(result.data[0].totalDurationMinutes).toBe(120);
    });

    it('maps null rating correctly', async () => {
      repo.findPublished.mockResolvedValue({ rows: [makeRow({ rating: null })], hasMore: false });
      const result = await service.listPublished({ limit: 5 });
      expect(result.data[0].rating).toBeNull();
    });

    it('includes nextCursor when hasMore is true', async () => {
      const row = makeRow({ id: 'c1', createdAt: new Date('2026-01-01T00:00:00Z') });
      repo.findPublished.mockResolvedValue({ rows: [row], hasMore: true });

      const result = await service.listPublished({ limit: 1 });

      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.nextCursor).not.toBeNull();
    });

    it('decodes cursor and passes it to repo', async () => {
      const payload = { createdAt: '2026-01-01T00:00:00.000Z', id: 'c1' };
      const cursor = Buffer.from(JSON.stringify(payload)).toString('base64url');

      await service.listPublished({ cursor });

      expect(repo.findPublished).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { createdAt: new Date('2026-01-01T00:00:00Z'), id: 'c1' },
        }),
      );
    });

    it('throws BadRequestException for malformed cursor', async () => {
      await expect(service.listPublished({ cursor: 'not-valid-base64!!' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('passes categoryId filter to repo', async () => {
      await service.listPublished({ categoryId: 'cat-1' });
      expect(repo.findPublished).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-1' }),
      );
    });

    it('passes level filter to repo', async () => {
      await service.listPublished({ level: 'beginner' as never });
      expect(repo.findPublished).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'beginner' }),
      );
    });

    it('trims and passes q search term to repo', async () => {
      await service.listPublished({ q: '  react  ' });
      expect(repo.findPublished).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'react' }),
      );
    });

    it('clamps limit to 100', async () => {
      await service.listPublished({ limit: 9999 });
      expect(repo.findPublished).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 }),
      );
    });

    it('defaults limit to 20 when not provided', async () => {
      await service.listPublished({});
      expect(repo.findPublished).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 }),
      );
    });
  });

  describe('getBySlug', () => {
    it('returns course detail for existing slug', async () => {
      const result = await service.getBySlug('react-basics');
      expect(result.slug).toBe('react-basics');
      expect(result.modules).toEqual([]);
      expect(result.category).toBeNull();
    });

    it('maps category when present', async () => {
      repo.findBySlug.mockResolvedValue({
        id: 'c1', title: 'Course', slug: 'react-basics', createdAt: new Date(),
        shortDescription: 'Short', description: null, level: null, thumbnailUrl: null,
        category: { id: 'cat-1', name: 'Dev', slug: 'dev' },
        instructor: { name: 'Ana' },
        modules: [],
      });

      const result = await service.getBySlug('react-basics');
      expect(result.category).toMatchObject({ id: 'cat-1', slug: 'dev' });
    });

    it('maps modules with lessons', async () => {
      repo.findBySlug.mockResolvedValue({
        id: 'c1', title: 'Course', slug: 'react-basics', createdAt: new Date(),
        shortDescription: null, description: null, level: null, thumbnailUrl: null,
        category: null, instructor: { name: 'Ana' },
        modules: [
          {
            id: 'mod-1', title: 'Intro', description: null, position: 1,
            lessons: [
              { id: 'l-1', title: 'Aula 1', contentType: 'video', duration: 300, position: 1 },
            ],
          },
        ],
      });

      const result = await service.getBySlug('react-basics');
      expect(result.modules[0].id).toBe('mod-1');
      expect(result.modules[0].lessons[0].duration).toBe(300);
    });

    it('throws NotFoundException for unknown slug', async () => {
      repo.findBySlug.mockResolvedValue(null);
      await expect(service.getBySlug('no-such-course')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cursor edge cases', () => {
    it('throws BadRequestException for cursor with missing id field', async () => {
      const malformed = Buffer.from(JSON.stringify({ createdAt: '2024-01-01T00:00:00Z' })).toString('base64url');
      await expect(service.listPublished({ cursor: malformed })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for cursor with invalid date', async () => {
      const malformed = Buffer.from(JSON.stringify({ createdAt: 'not-a-date', id: 'c1' })).toString('base64url');
      await expect(service.listPublished({ cursor: malformed })).rejects.toThrow(BadRequestException);
    });
  });

  describe('listCategories', () => {
    it('returns all categories', async () => {
      const result = await service.listCategories();
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('web');
    });
  });

  describe('getStats', () => {
    it('returns totalCourses, totalInstructors, percentFree from repo', async () => {
      const result = await service.getStats();
      expect(result.totalCourses).toBe(12);
      expect(result.totalInstructors).toBe(6);
      expect(result.percentFree).toBe(100);
    });

    it('delegates entirely to repo.getStats()', async () => {
      await service.getStats();
      expect(repo.getStats).toHaveBeenCalledOnce();
    });

    it('percentFree is always 100', async () => {
      repo.getStats.mockResolvedValue({ totalCourses: 0, totalInstructors: 0, percentFree: 100 });
      const result = await service.getStats();
      expect(result.percentFree).toBe(100);
    });
  });
});
