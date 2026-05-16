import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  UnprocessableEntityException, ServiceUnavailableException, NotFoundException,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';

const makeRepo = (overrides = {}) => ({
  findByModule: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByIdWithResources: vi.fn().mockResolvedValue(null),
  insert: vi.fn().mockImplementation((d) => Promise.resolve({ id: 'lesson-1', ...d })),
  update: vi.fn(),
  delete: vi.fn(),
  nextPosition: vi.fn().mockResolvedValue(1),
  updatePosition: vi.fn().mockResolvedValue(undefined),
  findAllIdsByModule: vi.fn().mockResolvedValue([]),
  ...overrides,
});

const makeModulesRepo = () => ({
  findById: vi.fn().mockResolvedValue({ id: 'module-1', courseId: 'course-1' }),
});

const makeCoursesRepo = () => ({
  findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'user-1' }),
});

const makeYoutube = (overrides = {}) => ({
  validateAndFetchInfo: vi.fn().mockResolvedValue({ videoId: 'abc12345678', durationSeconds: 213 }),
  extractVideoId: vi.fn().mockReturnValue('abc12345678'),
  parseDuration: vi.fn().mockReturnValue(213),
  ...overrides,
});

describe('LessonsService', () => {
  let service: LessonsService;

  beforeEach(() => {
    service = new LessonsService(
      makeRepo() as never,
      makeModulesRepo() as never,
      makeCoursesRepo() as never,
      makeYoutube() as never,
    );
  });

  describe('create', () => {
    it('cria aula com URL YouTube válida e popula durationSeconds', async () => {
      const repo = makeRepo();
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      await service.create(
        'module-1',
        { title: 'Aula 1', youtubeUrl: 'https://youtu.be/abc12345678' },
        'user-1',
        'instructor',
      );

      expect(repo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ youtubeVideoId: 'abc12345678', durationSeconds: 213 }),
      );
    });

    it('propaga UnprocessableEntityException do YouTubeService', async () => {
      const youtube = makeYoutube({
        validateAndFetchInfo: vi.fn().mockRejectedValue(
          new UnprocessableEntityException('URL inválida'),
        ),
      });
      service = new LessonsService(
        makeRepo() as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        youtube as never,
      );

      await expect(
        service.create('module-1', { title: 'Aula', youtubeUrl: 'bad-url' }, 'user-1', 'instructor'),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('propaga ServiceUnavailableException do YouTubeService', async () => {
      const youtube = makeYoutube({
        validateAndFetchInfo: vi.fn().mockRejectedValue(
          new ServiceUnavailableException('API indisponível'),
        ),
      });
      service = new LessonsService(
        makeRepo() as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        youtube as never,
      );

      await expect(
        service.create('module-1', { title: 'Aula', youtubeUrl: 'https://youtu.be/x' }, 'user-1', 'instructor'),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('reorder', () => {
    it('reordena aulas com IDs válidos', async () => {
      const ids = ['l1', 'l2', 'l3'];
      const repo = makeRepo({ findAllIdsByModule: vi.fn().mockResolvedValue([...ids]) });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      const result = await service.reorder('module-1', ids, 'user-1', 'instructor');
      expect(result).toEqual({ reordered: 3 });
    });

    it('lança 422 quando IDs não batem', async () => {
      const repo = makeRepo({ findAllIdsByModule: vi.fn().mockResolvedValue(['l1', 'l2']) });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      await expect(
        service.reorder('module-1', ['l1'], 'user-1', 'instructor'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('findById', () => {
    it('lança 404 quando aula não existe', async () => {
      await expect(service.findById('inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});
