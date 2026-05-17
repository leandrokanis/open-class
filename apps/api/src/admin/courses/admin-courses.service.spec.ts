import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminCoursesService } from './admin-courses.service';

const makeCoursesRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([
    { id: 'c1', title: 'Course 1', status: 'published', instructorId: 'u1' },
    { id: 'c2', title: 'Course 2', status: 'draft', instructorId: 'u2' },
  ]),
  ...overrides,
});

describe('AdminCoursesService', () => {
  let service: AdminCoursesService;
  let repo: ReturnType<typeof makeCoursesRepo>;

  beforeEach(() => {
    repo = makeCoursesRepo();
    service = new AdminCoursesService(repo as never);
  });

  describe('listAll', () => {
    it('returns all courses with no filters', async () => {
      const result = await service.listAll(1, 10, {});
      expect(repo.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(result).toHaveLength(2);
    });

    it('passes status filter to repository', async () => {
      await service.listAll(1, 10, { status: 'published' });
      expect(repo.findAll).toHaveBeenCalledWith(1, 10, { status: 'published' });
    });

    it('passes instructorId filter to repository', async () => {
      await service.listAll(1, 10, { instructorId: 'u1' });
      expect(repo.findAll).toHaveBeenCalledWith(1, 10, { instructorId: 'u1' });
    });

    it('passes combined filters to repository', async () => {
      await service.listAll(2, 5, { status: 'draft', instructorId: 'u2' });
      expect(repo.findAll).toHaveBeenCalledWith(2, 5, { status: 'draft', instructorId: 'u2' });
    });
  });
});
