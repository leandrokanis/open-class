import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  UnprocessableEntityException, ServiceUnavailableException, NotFoundException, ForbiddenException,
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
  findGroupIds: vi.fn().mockResolvedValue([]),
  compactGroup: vi.fn().mockResolvedValue(undefined),
  countExtraUnlockedStudents: vi.fn().mockResolvedValue(0),
  isExtraUnlockedFor: vi.fn().mockResolvedValue(false),
  findCohortModuleLock: vi.fn().mockResolvedValue(null),
  findCohortCourseId: vi.fn().mockResolvedValue('course-1'),
  findLessonCohortIds: vi.fn().mockResolvedValue([]),
  findCohortIdsForLessons: vi.fn().mockResolvedValue({}),
  getExclusiveAccess: vi.fn().mockResolvedValue({ cohortCount: 0, enrolledCount: 0, activeCount: 0 }),
  setLessonCohorts: vi.fn().mockResolvedValue(undefined),
  moveToModule: vi.fn().mockResolvedValue({ id: 'lesson-1', moduleId: 'module-2', position: 1 }),
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
    it('reordena as aulas normais quando os IDs cobrem exatamente esse grupo', async () => {
      // Arrange
      const ids = ['l3', 'l1', 'l2'];
      const repo = makeRepo({
        findGroupIds: vi.fn().mockImplementation((_m: string, isExtra: boolean) =>
          Promise.resolve(isExtra ? ['x1'] : ['l1', 'l2', 'l3'])),
      });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      // Act
      const result = await service.reorder('module-1', ids, 'user-1', 'instructor');

      // Assert — posições 1..K na ordem submetida, sem tocar nas extras
      expect(result).toEqual({ reordered: 3 });
      expect(repo.updatePosition).toHaveBeenCalledWith('l3', 1);
      expect(repo.updatePosition).toHaveBeenCalledWith('l1', 2);
      expect(repo.updatePosition).toHaveBeenCalledWith('l2', 3);
      expect(repo.updatePosition).not.toHaveBeenCalledWith('x1', expect.anything());
    });

    it('reordena as aulas extras independentemente das normais', async () => {
      // Arrange
      const repo = makeRepo({
        findGroupIds: vi.fn().mockImplementation((_m: string, isExtra: boolean) =>
          Promise.resolve(isExtra ? ['x1', 'x2'] : ['l1', 'l2'])),
      });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      // Act
      const result = await service.reorder('module-1', ['x2', 'x1'], 'user-1', 'instructor');

      // Assert
      expect(result).toEqual({ reordered: 2 });
      expect(repo.updatePosition).toHaveBeenCalledWith('x2', 1);
      expect(repo.updatePosition).toHaveBeenCalledWith('x1', 2);
    });

    it('lança 422 para conjunto misto de normais e extras', async () => {
      const repo = makeRepo({
        findGroupIds: vi.fn().mockImplementation((_m: string, isExtra: boolean) =>
          Promise.resolve(isExtra ? ['x1'] : ['l1', 'l2'])),
      });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      await expect(
        service.reorder('module-1', ['l1', 'x1'], 'user-1', 'instructor'),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('lança 422 quando IDs não cobrem o grupo inteiro', async () => {
      const repo = makeRepo({
        findGroupIds: vi.fn().mockImplementation((_m: string, isExtra: boolean) =>
          Promise.resolve(isExtra ? [] : ['l1', 'l2'])),
      });
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

  describe('aulas extras (US-21)', () => {
    it('cria aula extra no fim do grupo de extras', async () => {
      // Arrange
      const repo = makeRepo({ nextPosition: vi.fn().mockResolvedValue(3) });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      // Act
      await service.create('module-1', { title: 'Bônus', isExtra: true }, 'user-1', 'instrutor');

      // Assert — posição calculada dentro do grupo de extras
      expect(repo.nextPosition).toHaveBeenCalledWith('module-1', true);
      expect(repo.insert).toHaveBeenCalledWith(expect.objectContaining({ isExtra: true, position: 3 }));
    });

    it('marca aula normal como extra: move para o fim do grupo extra e compacta as normais', async () => {
      // Arrange
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({
          id: 'lesson-1', moduleId: 'module-1', isExtra: false, position: 1,
          youtubeUrl: null, youtubeVideoId: null, duration: null,
        }),
        nextPosition: vi.fn().mockResolvedValue(2),
        update: vi.fn().mockImplementation((id, d) => Promise.resolve({ id, ...d })),
      });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      // Act
      await service.update('lesson-1', { isExtra: true }, 'user-1', 'instrutor');

      // Assert
      expect(repo.nextPosition).toHaveBeenCalledWith('module-1', true);
      expect(repo.update).toHaveBeenCalledWith('lesson-1', expect.objectContaining({ isExtra: true, position: 2 }));
      expect(repo.compactGroup).toHaveBeenCalledWith('module-1', false);
    });

    it('desmarca extra: volta ao fim do grupo normal e compacta as extras', async () => {
      // Arrange
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({
          id: 'lesson-9', moduleId: 'module-1', isExtra: true, position: 1,
          youtubeUrl: null, youtubeVideoId: null, duration: null,
        }),
        nextPosition: vi.fn().mockResolvedValue(4),
        update: vi.fn().mockImplementation((id, d) => Promise.resolve({ id, ...d })),
      });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      // Act
      await service.update('lesson-9', { isExtra: false }, 'user-1', 'instrutor');

      // Assert
      expect(repo.nextPosition).toHaveBeenCalledWith('module-1', false);
      expect(repo.update).toHaveBeenCalledWith('lesson-9', expect.objectContaining({ isExtra: false, position: 4 }));
      expect(repo.compactGroup).toHaveBeenCalledWith('module-1', true);
    });

    it('update sem isExtra não muda grupo nem posição', async () => {
      // Arrange
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({
          id: 'lesson-1', moduleId: 'module-1', isExtra: false, position: 2,
          youtubeUrl: null, youtubeVideoId: null, duration: null,
        }),
        update: vi.fn().mockImplementation((id, d) => Promise.resolve({ id, ...d })),
      });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      // Act
      await service.update('lesson-1', { title: 'Novo título' }, 'user-1', 'instrutor');

      // Assert
      expect(repo.compactGroup).not.toHaveBeenCalled();
      const updateArg = (repo.update as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(updateArg).not.toHaveProperty('position');
      expect(updateArg).not.toHaveProperty('isExtra');
    });

    it('update com isExtra igual ao atual não recalcula posição', async () => {
      // Arrange
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({
          id: 'lesson-1', moduleId: 'module-1', isExtra: true, position: 1,
          youtubeUrl: null, youtubeVideoId: null, duration: null,
        }),
        update: vi.fn().mockImplementation((id, d) => Promise.resolve({ id, ...d })),
      });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      // Act
      await service.update('lesson-1', { isExtra: true, title: 'x' }, 'user-1', 'instrutor');

      // Assert
      expect(repo.nextPosition).not.toHaveBeenCalled();
      expect(repo.compactGroup).not.toHaveBeenCalled();
    });

    it('extraUnlocksCount retorna contagem para o dono do curso', async () => {
      // Arrange
      const repo = makeRepo({ countExtraUnlockedStudents: vi.fn().mockResolvedValue(7) });
      service = new LessonsService(
        repo as never,
        makeModulesRepo() as never,
        makeCoursesRepo() as never,
        makeYoutube() as never,
      );

      // Act
      const result = await service.extraUnlocksCount('module-1', 'user-1', 'instrutor');

      // Assert
      expect(result).toEqual({ unlockedStudents: 7 });
      expect(repo.countExtraUnlockedStudents).toHaveBeenCalledWith('module-1');
    });

    it('extraUnlocksCount lança Forbidden para instrutor que não é dono', async () => {
      await expect(
        service.extraUnlocksCount('module-1', 'outro-user', 'instrutor'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('aulas exclusivas de turma (US-25 many-to-many)', () => {
    const exclusiveLesson = {
      id: 'lesson-exc', moduleId: 'module-1', visibility: 'visible',
      isExtra: false, resources: [],
    };

    it('cria aula exclusiva vinculando as turmas quando pertencem ao curso', async () => {
      const repo = makeRepo({
        nextPosition: vi.fn().mockResolvedValue(5),
        insert: vi.fn().mockResolvedValue({ id: 'lesson-new', moduleId: 'module-1' }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await service.create('module-1', { title: 'Bônus da turma', cohortIds: ['cohort-1', 'cohort-2'] }, 'user-1', 'instrutor');

      expect(repo.findCohortCourseId).toHaveBeenCalledWith('cohort-1');
      expect(repo.findCohortCourseId).toHaveBeenCalledWith('cohort-2');
      expect(repo.setLessonCohorts).toHaveBeenCalledWith('lesson-new', ['cohort-1', 'cohort-2']);
    });

    it('rejeita turma de outro curso (422)', async () => {
      const repo = makeRepo({ findCohortCourseId: vi.fn().mockResolvedValue('outro-curso') });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await expect(
        service.create('module-1', { title: 'Bônus', cohortIds: ['cohort-x'] }, 'user-1', 'instrutor'),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(repo.insert).not.toHaveBeenCalled();
    });

    it('setCohorts substitui a lista de turmas da aula', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ id: 'lesson-exc', moduleId: 'module-1' }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.setCohorts('lesson-exc', ['cohort-1'], 'user-1', 'instrutor');

      expect(repo.setLessonCohorts).toHaveBeenCalledWith('lesson-exc', ['cohort-1']);
      expect(result).toEqual({ lessonId: 'lesson-exc', cohortIds: ['cohort-1'] });
    });

    it('findById nega exclusiva para aluno fora de qualquer turma da aula (404)', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(exclusiveLesson),
        findLessonCohortIds: vi.fn().mockResolvedValue(['cohort-1']),
        getExclusiveAccess: vi.fn().mockResolvedValue({ cohortCount: 1, enrolledCount: 0, activeCount: 0 }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await expect(service.findById('lesson-exc', 'aluno', 'student-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('findById entrega exclusiva para aluno de uma turma ativa da aula', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(exclusiveLesson),
        findLessonCohortIds: vi.fn().mockResolvedValue(['cohort-1']),
        getExclusiveAccess: vi.fn().mockResolvedValue({ cohortCount: 1, enrolledCount: 1, activeCount: 1 }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findById('lesson-exc', 'aluno', 'student-1');
      expect(result.id).toBe('lesson-exc');
      expect(repo.getExclusiveAccess).toHaveBeenCalledWith('student-1', 'lesson-exc');
    });

    it('findById nega exclusiva quando só há turmas encerradas (403)', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(exclusiveLesson),
        findLessonCohortIds: vi.fn().mockResolvedValue(['cohort-1']),
        getExclusiveAccess: vi.fn().mockResolvedValue({ cohortCount: 1, enrolledCount: 1, activeCount: 0 }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await expect(service.findById('lesson-exc', 'aluno', 'student-1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('findByModule esconde exclusivas de não-staff', async () => {
      const repo = makeRepo({
        findByModule: vi.fn().mockResolvedValue([
          { id: 'l1', visibility: 'visible' },
          { id: 'l2', visibility: 'visible' },
        ]),
        findCohortIdsForLessons: vi.fn().mockResolvedValue({ l2: ['cohort-1'] }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findByModule('module-1', 'aluno');
      expect(result.map((l: { id: string }) => l.id)).toEqual(['l1']);
    });

    it('findByModule mostra exclusivas (com cohortIds) para instrutor', async () => {
      const repo = makeRepo({
        findByModule: vi.fn().mockResolvedValue([
          { id: 'l1', visibility: 'visible' },
          { id: 'l2', visibility: 'visible' },
        ]),
        findCohortIdsForLessons: vi.fn().mockResolvedValue({ l2: ['cohort-1'] }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findByModule('module-1', 'instrutor');
      expect(result).toHaveLength(2);
      expect(result.find((l: { id: string }) => l.id === 'l2')?.cohortIds).toEqual(['cohort-1']);
    });
  });

  describe('findById com cronograma de turma (US-24)', () => {
    const regularLesson = {
      id: 'lesson-1', moduleId: 'module-1', visibility: 'visible', isExtra: false, resources: [],
    };
    const FUTURE = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    const PAST = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    it('nega aula de módulo ainda não liberado para aluno de turma', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(regularLesson),
        findCohortModuleLock: vi.fn().mockResolvedValue({ availableFrom: FUTURE, cohortClosed: false }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await expect(service.findById('lesson-1', 'aluno', 'student-1'))
        .rejects.toThrow(ForbiddenException);
      expect(repo.findCohortModuleLock).toHaveBeenCalledWith('student-1', 'module-1');
    });

    it('libera aula de módulo com data atingida', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(regularLesson),
        findCohortModuleLock: vi.fn().mockResolvedValue({ availableFrom: PAST, cohortClosed: false }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findById('lesson-1', 'aluno', 'student-1');
      expect(result.id).toBe('lesson-1');
    });

    it('turma encerrada libera módulos regulares mesmo com data futura', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(regularLesson),
        findCohortModuleLock: vi.fn().mockResolvedValue({ availableFrom: FUTURE, cohortClosed: true }),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findById('lesson-1', 'aluno', 'student-1');
      expect(result.id).toBe('lesson-1');
    });

    it('aluno on demand (sem turma) não é afetado', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(regularLesson),
        findCohortModuleLock: vi.fn().mockResolvedValue(null),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findById('lesson-1', 'aluno', 'student-1');
      expect(result.id).toBe('lesson-1');
    });

    it('instrutor não passa pela checagem de cronograma', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(regularLesson),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await service.findById('lesson-1', 'instrutor', 'user-1');
      expect(repo.findCohortModuleLock).not.toHaveBeenCalled();
    });
  });

  describe('findById em aula extra (US-20)', () => {
    const extraLesson = {
      id: 'lesson-x', moduleId: 'module-1', visibility: 'visible', isExtra: true, resources: [],
    };

    it('nega extra bloqueada para aluno', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(extraLesson),
        isExtraUnlockedFor: vi.fn().mockResolvedValue(false),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await expect(service.findById('lesson-x', 'aluno', 'student-1'))
        .rejects.toThrow(ForbiddenException);
      expect(repo.isExtraUnlockedFor).toHaveBeenCalledWith('student-1', 'module-1');
    });

    it('retorna extra desbloqueada para aluno', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(extraLesson),
        isExtraUnlockedFor: vi.fn().mockResolvedValue(true),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findById('lesson-x', 'aluno', 'student-1');
      expect(result.id).toBe('lesson-x');
    });

    it('nega extra para usuário não autenticado', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(extraLesson),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      await expect(service.findById('lesson-x', undefined, undefined))
        .rejects.toThrow(ForbiddenException);
    });

    it('instrutor acessa extra sem verificação de desbloqueio', async () => {
      const repo = makeRepo({
        findByIdWithResources: vi.fn().mockResolvedValue(extraLesson),
      });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, makeYoutube() as never);

      const result = await service.findById('lesson-x', 'instrutor', 'user-1');
      expect(result.id).toBe('lesson-x');
      expect(repo.isExtraUnlockedFor).not.toHaveBeenCalled();
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

  describe('move', () => {
    it('chama moveToModule com os argumentos corretos (cross-module)', async () => {
      const lesson = { id: 'lesson-1', moduleId: 'module-1' };
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(lesson) });
      const modulesRepo = {
        findById: vi.fn().mockResolvedValue({ id: 'module-1', courseId: 'course-1' }),
      };
      service = new LessonsService(repo as never, modulesRepo as never, makeCoursesRepo() as never, makeYoutube() as never);

      await service.move('lesson-1', { moduleId: 'module-2', position: 1 }, 'user-1', 'instrutor');

      expect(repo.moveToModule).toHaveBeenCalledWith('lesson-1', 'module-1', 'module-2', 1);
    });

    it('lança NotFoundException quando aula não existe', async () => {
      await expect(
        service.move('missing', { moduleId: 'module-2', position: 1 }, 'user-1', 'instrutor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança ForbiddenException quando instrutor não tem ownership da aula', async () => {
      const lesson = { id: 'lesson-1', moduleId: 'module-1' };
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(lesson) });
      const modulesRepo = { findById: vi.fn().mockResolvedValue({ id: 'module-1', courseId: 'course-1' }) };
      const coursesRepo = { findById: vi.fn().mockResolvedValue({ id: 'course-1', instructorId: 'outro-user' }) };
      service = new LessonsService(repo as never, modulesRepo as never, coursesRepo as never, makeYoutube() as never);

      await expect(
        service.move('lesson-1', { moduleId: 'module-2', position: 1 }, 'user-1', 'instrutor'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lança ForbiddenException quando instrutor não tem ownership do módulo destino', async () => {
      const lesson = { id: 'lesson-1', moduleId: 'module-1' };
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(lesson) });
      // module-1 → course-1 → user-1 (owner)
      // module-2 → course-2 → outro-user (not owner)
      const modulesRepo = {
        findById: vi.fn()
          .mockResolvedValueOnce({ id: 'module-1', courseId: 'course-1' })
          .mockResolvedValueOnce({ id: 'module-2', courseId: 'course-2' }),
      };
      const coursesRepo = {
        findById: vi.fn()
          .mockResolvedValueOnce({ id: 'course-1', instructorId: 'user-1' })
          .mockResolvedValueOnce({ id: 'course-2', instructorId: 'outro-user' }),
      };
      service = new LessonsService(repo as never, modulesRepo as never, coursesRepo as never, makeYoutube() as never);

      await expect(
        service.move('lesson-1', { moduleId: 'module-2', position: 1 }, 'user-1', 'instrutor'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update — lógica de duração', () => {
    const existingLesson = {
      id: 'lesson-1',
      moduleId: 'module-1',
      youtubeUrl: 'https://youtu.be/OLD00000000',
      youtubeVideoId: 'OLD00000000',
      duration: 100,
      visibility: 'visible',
    };

    it('URL muda, sem dto.duration → usa duração do YouTube', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(existingLesson),
        update: vi.fn().mockResolvedValue({ ...existingLesson, duration: 213 }),
      });
      const youtube = makeYoutube({ validateAndFetchInfo: vi.fn().mockResolvedValue({ videoId: 'NEW00000000', durationSeconds: 213 }) });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, youtube as never);

      await service.update('lesson-1', { youtubeUrl: 'https://youtu.be/NEW00000000' }, 'user-1', 'instrutor');

      expect(youtube.validateAndFetchInfo).toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith('lesson-1', expect.objectContaining({ duration: 213 }));
    });

    it('URL muda, dto.duration presente → usa dto.duration (override manual)', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(existingLesson),
        update: vi.fn().mockResolvedValue({ ...existingLesson, duration: 300 }),
      });
      const youtube = makeYoutube({ validateAndFetchInfo: vi.fn().mockResolvedValue({ videoId: 'NEW00000000', durationSeconds: 213 }) });
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, youtube as never);

      await service.update('lesson-1', { youtubeUrl: 'https://youtu.be/NEW00000000', duration: 300 }, 'user-1', 'instrutor');

      expect(repo.update).toHaveBeenCalledWith('lesson-1', expect.objectContaining({ duration: 300 }));
    });

    it('URL não muda, apenas dto.duration → persiste valor manual sem chamar YouTube', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(existingLesson),
        update: vi.fn().mockResolvedValue({ ...existingLesson, duration: 180 }),
      });
      const youtube = makeYoutube();
      service = new LessonsService(repo as never, makeModulesRepo() as never, makeCoursesRepo() as never, youtube as never);

      await service.update('lesson-1', { duration: 180 }, 'user-1', 'instrutor');

      expect(youtube.validateAndFetchInfo).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith('lesson-1', expect.objectContaining({ duration: 180 }));
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
