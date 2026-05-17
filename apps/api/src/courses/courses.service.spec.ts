import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CoursesService } from './courses.service';

const instructor = { id: 'user-1', role: 'instrutor' };
const admin = { id: 'admin-1', role: 'admin' };

const makeCourse = (overrides = {}) => ({
  id: 'course-1',
  instructorId: 'user-1',
  title: 'My Course',
  slug: 'my-course',
  status: 'draft',
  ...overrides,
});

const makeRepo = (overrides = {}) => ({
  create: vi.fn().mockImplementation((d) => Promise.resolve({ id: 'course-1', ...d })),
  findById: vi.fn().mockResolvedValue(makeCourse()),
  findWithModulesAndLessons: vi.fn().mockResolvedValue(makeCourse()),
  findByInstructorId: vi.fn().mockResolvedValue([makeCourse()]),
  update: vi.fn().mockImplementation((id, d) => Promise.resolve({ id, ...d })),
  softDelete: vi.fn().mockResolvedValue(undefined),
  slugExists: vi.fn().mockResolvedValue(false),
  countVisibleLessons: vi.fn().mockResolvedValue(1),
  findAll: vi.fn().mockResolvedValue([]),
  ...overrides,
});

const makeUpload = () => ({ thumbnailUrl: vi.fn().mockReturnValue('/uploads/thumb.jpg') });

describe('CoursesService', () => {
  let service: CoursesService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new CoursesService(repo as never, makeUpload() as never);
  });

  describe('create', () => {
    it('creates course with slug derived from title', async () => {
      const result = await service.create(instructor, { title: 'My Course' } as never);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'my-course', instructorId: 'user-1' }),
      );
      expect(result.id).toBe('course-1');
    });

    it('appends suffix when slug already exists', async () => {
      repo.slugExists
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await service.create(instructor, { title: 'My Course' } as never);

      const saved = repo.create.mock.calls[0][0];
      expect(saved.slug).toBe('my-course-2');
    });
  });

  describe('findOne', () => {
    it('returns full course tree for owner', async () => {
      const result = await service.findOne('course-1', instructor);
      expect(result.id).toBe('course-1');
    });

    it('returns course for admin regardless of ownership', async () => {
      repo.findWithModulesAndLessons.mockResolvedValue(makeCourse({ instructorId: 'other' }));
      const result = await service.findOne('course-1', admin);
      expect(result.id).toBe('course-1');
    });

    it('throws ForbiddenException for non-owner instructor', async () => {
      repo.findWithModulesAndLessons.mockResolvedValue(makeCourse({ instructorId: 'other' }));
      await expect(service.findOne('course-1', instructor)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for unknown course', async () => {
      repo.findWithModulesAndLessons.mockResolvedValue(null);
      await expect(service.findOne('missing', instructor)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates allowed fields for owner', async () => {
      await service.update('course-1', instructor, { title: 'New Title' } as never);
      expect(repo.update).toHaveBeenCalledWith(
        'course-1',
        expect.objectContaining({ title: 'New Title' }),
      );
    });

    it('throws ForbiddenException for non-owner', async () => {
      repo.findById.mockResolvedValue(makeCourse({ instructorId: 'other' }));
      await expect(
        service.update('course-1', instructor, { title: 'x' } as never),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for missing course', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', instructor, {} as never)).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('publishes course with at least one visible lesson', async () => {
      await service.publish('course-1', instructor);
      expect(repo.update).toHaveBeenCalledWith('course-1', { status: 'published' });
    });

    it('throws BadRequestException when no visible lessons', async () => {
      repo.countVisibleLessons.mockResolvedValue(0);
      await expect(service.publish('course-1', instructor)).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException for non-owner', async () => {
      repo.findById.mockResolvedValue(makeCourse({ instructorId: 'other' }));
      await expect(service.publish('course-1', instructor)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('unpublish', () => {
    it('sets status to draft', async () => {
      await service.unpublish('course-1', instructor);
      expect(repo.update).toHaveBeenCalledWith('course-1', { status: 'draft' });
    });
  });

  describe('remove', () => {
    it('soft-deletes course for owner', async () => {
      await service.remove('course-1', instructor);
      expect(repo.softDelete).toHaveBeenCalledWith('course-1');
    });

    it('throws ForbiddenException for non-owner', async () => {
      repo.findById.mockResolvedValue(makeCourse({ instructorId: 'other' }));
      await expect(service.remove('course-1', instructor)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for missing course', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('x', instructor)).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadThumbnail', () => {
    const file = { filename: 'thumb.jpg' } as never;

    it('saves thumbnail url for owner', async () => {
      await service.uploadThumbnail('course-1', instructor, file);
      expect(repo.update).toHaveBeenCalledWith(
        'course-1',
        expect.objectContaining({ thumbnailUrl: '/uploads/thumb.jpg' }),
      );
    });

    it('throws BadRequestException when no file provided', async () => {
      await expect(service.uploadThumbnail('course-1', instructor, null as never)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
