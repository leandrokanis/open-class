import {
  Injectable, NotFoundException, ForbiddenException, UnprocessableEntityException,
} from '@nestjs/common';
import { LessonsRepository } from './lessons.repository';
import { ModulesRepository } from '../modules/modules.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { YouTubeService } from '../youtube/youtube.service';
import type { CreateLessonDto } from './dto/create-lesson.dto';
import type { UpdateLessonDto } from './dto/update-lesson.dto';
import type { MoveLessonDto } from './dto/move-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    private readonly repo: LessonsRepository,
    private readonly modulesRepo: ModulesRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly youtube: YouTubeService,
  ) {}

  async create(moduleId: string, dto: CreateLessonDto, userId: string, userRole: string) {
    await this.assertModuleOwnership(moduleId, userId, userRole);
    let videoId: string | null = null;
    let durationSeconds: number | null = null;
    if (dto.youtubeUrl) {
      const info = await this.youtube.validateAndFetchInfo(dto.youtubeUrl);
      videoId = info.videoId;
      durationSeconds = info.durationSeconds;
    }
    const position = await this.repo.nextPosition(moduleId);
    return this.repo.insert({
      moduleId,
      title: dto.title,
      description: dto.description,
      youtubeUrl: dto.youtubeUrl ?? null,
      youtubeVideoId: videoId,
      duration: durationSeconds,
      position,
      visibility: 'hidden',
    });
  }

  async findByModule(moduleId: string, userRole?: string) {
    const all = await this.repo.findByModule(moduleId);
    if (userRole === 'instrutor' || userRole === 'admin') return all;
    return all.filter((l) => l.visibility === 'visible');
  }

  async findById(id: string, userRole?: string) {
    const lesson = await this.repo.findByIdWithResources(id);
    if (!lesson) throw new NotFoundException('Aula não encontrada.');
    if (lesson.visibility !== 'visible' && userRole !== 'instrutor' && userRole !== 'admin') {
      throw new NotFoundException('Aula não encontrada.');
    }
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto, userId: string, userRole: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new NotFoundException('Aula não encontrada.');
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);

    let youtubeVideoId = lesson.youtubeVideoId;
    let duration = lesson.duration;

    if (dto.youtubeUrl && dto.youtubeUrl !== lesson.youtubeUrl) {
      const info = await this.youtube.validateAndFetchInfo(dto.youtubeUrl);
      youtubeVideoId = info.videoId;
      duration = info.durationSeconds;
    }

    return this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      youtubeUrl: dto.youtubeUrl,
      youtubeVideoId,
      duration,
      ...(dto.isVisible !== undefined
        ? { visibility: dto.isVisible ? 'visible' : 'hidden' }
        : {}),
    });
  }

  async move(id: string, dto: MoveLessonDto, userId: string, userRole: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new NotFoundException('Aula não encontrada.');
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);
    await this.assertModuleOwnership(dto.moduleId, userId, userRole);
    return this.repo.moveToModule(id, lesson.moduleId, dto.moduleId, dto.position);
  }

  async setVisibility(id: string, visibility: 'visible' | 'hidden', userId: string, userRole: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new NotFoundException('Aula não encontrada.');
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);
    return this.repo.update(id, { visibility });
  }

  async delete(id: string, userId: string, userRole: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new NotFoundException('Aula não encontrada.');
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);
    await this.repo.delete(id);
  }

  async reorder(moduleId: string, ids: string[], userId: string, userRole: string) {
    await this.assertModuleOwnership(moduleId, userId, userRole);
    const currentIds = await this.repo.findAllIdsByModule(moduleId);
    this.assertSameSet(currentIds, ids, 'aulas do módulo');
    await Promise.all(ids.map((id, i) => this.repo.updatePosition(id, i + 1)));
    return { reordered: ids.length };
  }

  async assertLessonOwnership(lessonId: string, userId: string, userRole: string) {
    const lesson = await this.repo.findById(lessonId);
    if (!lesson) throw new NotFoundException('Aula não encontrada.');
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);
  }

  private async assertModuleOwnership(moduleId: string, userId: string, userRole: string) {
    const mod = await this.modulesRepo.findById(moduleId);
    if (!mod) throw new NotFoundException('Módulo não encontrado.');
    const course = await this.coursesRepo.findById(mod.courseId);
    if (!course) throw new NotFoundException('Curso não encontrado.');
    if (userRole !== 'admin' && course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para modificar este módulo.');
    }
  }

  private assertSameSet(current: string[], incoming: string[], label: string) {
    const currentSet = new Set(current);
    const incomingSet = new Set(incoming);
    if (currentSet.size !== incomingSet.size || ![...currentSet].every((id) => incomingSet.has(id))) {
      throw new UnprocessableEntityException(
        `Os IDs enviados não correspondem ao conjunto atual de ${label}.`,
      );
    }
  }
}
