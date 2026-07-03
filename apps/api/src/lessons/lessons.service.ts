import {
  Injectable, NotFoundException, ForbiddenException, UnprocessableEntityException,
} from '@nestjs/common';
import { LessonsRepository } from './lessons.repository';
import { ModulesRepository } from '../modules/modules.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { YouTubeService } from '../youtube/youtube.service';
import { t } from '../i18n/translate';
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
    // Aula exclusiva de turma: a turma precisa pertencer ao curso do módulo (US-25)
    if (dto.cohortId) {
      const mod = await this.modulesRepo.findById(moduleId);
      const cohortCourseId = await this.repo.findCohortCourseId(dto.cohortId);
      if (!cohortCourseId || cohortCourseId !== mod?.courseId) {
        throw new UnprocessableEntityException(t('cohorts.module_not_in_course'));
      }
    }

    const isExtra = dto.isExtra ?? false;
    const position = await this.repo.nextPosition(moduleId, isExtra);
    return this.repo.insert({
      moduleId,
      title: dto.title,
      description: dto.description,
      youtubeUrl: dto.youtubeUrl ?? null,
      youtubeVideoId: videoId,
      duration: durationSeconds,
      position,
      visibility: 'hidden',
      isExtra,
      cohortId: dto.cohortId ?? null,
    });
  }

  async findByModule(moduleId: string, userRole?: string) {
    const all = await this.repo.findByModule(moduleId);
    if (userRole === 'instrutor' || userRole === 'admin') return all;
    // Exclusivas de turma ficam fora da listagem pública (US-25)
    return all.filter((l) => l.visibility === 'visible' && !l.cohortId);
  }

  async findById(id: string, userRole?: string, userId?: string) {
    const lesson = await this.repo.findByIdWithResources(id);
    if (!lesson) throw new NotFoundException(t('lessons.not_found'));
    const isStaff = userRole === 'instrutor' || userRole === 'admin';
    if (lesson.visibility !== 'visible' && !isStaff) {
      throw new NotFoundException(t('lessons.not_found'));
    }
    // Aula exclusiva de turma: só para matriculados na turma, e só enquanto ativa (US-25)
    if (lesson.cohortId && !isStaff) {
      const access = userId ? await this.repo.findCohortAccess(userId, lesson.cohortId) : null;
      if (!access) throw new NotFoundException(t('lessons.not_found'));
      if (access.closed) throw new ForbiddenException(t('cohorts.exclusive_closed'));
    }
    // Extra bloqueada para quem ainda não concluiu as normais do módulo (US-20)
    if (lesson.isExtra && !isStaff) {
      const unlocked = userId ? await this.repo.isExtraUnlockedFor(userId, lesson.moduleId) : false;
      if (!unlocked) throw new ForbiddenException(t('progress.extra_locked'));
    }
    // Cronograma de turma: módulo ainda não liberado bloqueia a aula (US-24)
    if (!isStaff && userId) {
      const lock = await this.repo.findCohortModuleLock(userId, lesson.moduleId);
      if (lock && !lock.cohortClosed && lock.availableFrom && lock.availableFrom > new Date()) {
        throw new ForbiddenException(t('cohorts.module_locked'));
      }
    }
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto, userId: string, userRole: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new NotFoundException(t('lessons.not_found'));
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);

    let youtubeVideoId = lesson.youtubeVideoId;
    let duration = lesson.duration;

    if (dto.youtubeUrl && dto.youtubeUrl !== lesson.youtubeUrl) {
      const info = await this.youtube.validateAndFetchInfo(dto.youtubeUrl);
      youtubeVideoId = info.videoId;
      // dto.duration > 0 means client explicitly set it; 0 means not yet loaded → use YouTube
      duration = (dto.duration !== undefined && dto.duration > 0) ? dto.duration : info.durationSeconds;
    } else if (dto.duration !== undefined) {
      duration = dto.duration;
    }

    // Troca de grupo (normal ↔ extra): vai para o fim do grupo de destino
    // e o grupo de origem é compactado (US-21)
    const groupChanged = dto.isExtra !== undefined && dto.isExtra !== lesson.isExtra;
    const groupFields = groupChanged
      ? { isExtra: dto.isExtra, position: await this.repo.nextPosition(lesson.moduleId, dto.isExtra) }
      : {};

    const updated = await this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      youtubeUrl: dto.youtubeUrl,
      youtubeVideoId,
      duration,
      ...(dto.isVisible !== undefined
        ? { visibility: dto.isVisible ? 'visible' : 'hidden' }
        : {}),
      ...groupFields,
    });

    if (groupChanged) {
      await this.repo.compactGroup(lesson.moduleId, lesson.isExtra);
    }
    return updated;
  }

  async move(id: string, dto: MoveLessonDto, userId: string, userRole: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new NotFoundException(t('lessons.not_found'));
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);
    await this.assertModuleOwnership(dto.moduleId, userId, userRole);
    return this.repo.moveToModule(id, lesson.moduleId, dto.moduleId, dto.position);
  }

  async setVisibility(id: string, visibility: 'visible' | 'hidden', userId: string, userRole: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new NotFoundException(t('lessons.not_found'));
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);
    return this.repo.update(id, { visibility });
  }

  async delete(id: string, userId: string, userRole: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new NotFoundException(t('lessons.not_found'));
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);
    await this.repo.delete(id);
  }

  async reorder(moduleId: string, ids: string[], userId: string, userRole: string) {
    await this.assertModuleOwnership(moduleId, userId, userRole);
    // Reordenação é por grupo: o conjunto submetido deve ser exatamente
    // as aulas normais OU as aulas extras do módulo (US-21)
    const normals = await this.repo.findGroupIds(moduleId, false);
    const extras = await this.repo.findGroupIds(moduleId, true);
    if (!this.isSameSet(normals, ids) && !this.isSameSet(extras, ids)) {
      throw new UnprocessableEntityException(
        t('lessons.reorder_set_mismatch', { label: t('lessons.reorder_label') }),
      );
    }
    await Promise.all(ids.map((id, i) => this.repo.updatePosition(id, i + 1)));
    return { reordered: ids.length };
  }

  async extraUnlocksCount(moduleId: string, userId: string, userRole: string) {
    await this.assertModuleOwnership(moduleId, userId, userRole);
    const unlockedStudents = await this.repo.countExtraUnlockedStudents(moduleId);
    return { unlockedStudents };
  }

  async assertLessonOwnership(lessonId: string, userId: string, userRole: string) {
    const lesson = await this.repo.findById(lessonId);
    if (!lesson) throw new NotFoundException(t('lessons.not_found'));
    await this.assertModuleOwnership(lesson.moduleId, userId, userRole);
  }

  private async assertModuleOwnership(moduleId: string, userId: string, userRole: string) {
    const mod = await this.modulesRepo.findById(moduleId);
    if (!mod) throw new NotFoundException(t('modules.not_found'));
    const course = await this.coursesRepo.findById(mod.courseId);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (userRole !== 'admin' && course.instructorId !== userId) {
      throw new ForbiddenException(t('lessons.no_permission'));
    }
  }

  private isSameSet(current: string[], incoming: string[]): boolean {
    const currentSet = new Set(current);
    const incomingSet = new Set(incoming);
    return currentSet.size === incomingSet.size && [...currentSet].every((id) => incomingSet.has(id));
  }
}
