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
        'instrutor',
      );

      expect(repo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ youtubeVideoId: 'abc12345678', duration: 213 }),
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

    it('retorna aula visível para qualquer role', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue({
          id: 'lesson-1', visibility: 'visible', resources: [],
        }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findById('lesson-1', 'aluno');
      expect(result.id).toBe('lesson-1');
    });

    it('lança 404 para aula oculta acessada por aluno', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue({
          id: 'lesson-1', visibility: 'hidden', resources: [],
        }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await expect(service.findById('lesson-1', 'aluno')).rejects.toThrow(NotFoundException);
    });

    it('retorna aula oculta para instrutor', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue({
          id: 'lesson-1', visibility: 'hidden', resources: [],
        }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findById('lesson-1', 'instrutor');
      expect(result.id).toBe('lesson-1');
    });
  });

  describe('assertLessonOwnership', () => {
    it('throws NotFoundException when lesson not found', async () => {
      await expect(service.assertLessonOwnership('missing', 'user-1', 'instructor')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when course not found for lesson owner check', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ id: 'lesson-1', moduleId: 'module-1' }),
      });
      const modulesRepo = makeModulesRepo();
      const coursesRepo = { findById: vi.fn().mockResolvedValue(null) };
      service = new LessonsService(repo as never, modulesRepo as never, coursesRepo as never, makeYoutube() as never);

      await expect(service.assertLessonOwnership('lesson-1', 'user-1', 'instructor')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByModule', () => {
    it('retorna apenas aulas visíveis para aluno', async () => {
      const repo = makeRepo({
        findByModule: vi.fn().mockResolvedValue([
          { id: 'l1', visibility: 'visible' },
          { id: 'l2', visibility: 'hidden' },
        ]),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findByModule('module-1', 'aluno');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('l1');
    });

    it('retorna todas as aulas para instrutor', async () => {
      const repo = makeRepo({
        findByModule: vi.fn().mockResolvedValue([
          { id: 'l1', visibility: 'visible' },
          { id: 'l2', visibility: 'hidden' },
        ]),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findByModule('module-1', 'instrutor');
      expect(result).toHaveLength(2);
    });
  });
});
