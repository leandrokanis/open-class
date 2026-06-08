import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { CoursesRepository } from '../courses.repository';
import { t } from '../../i18n/translate';
import type { CreateLessonDto } from '../dto/create-lesson.dto';
import type { UpdateLessonDto } from '../dto/update-lesson.dto';

interface RequestingUser { id: string; role: string }

@Injectable()
export class LessonsService {
  constructor(private readonly repo: CoursesRepository) {}

  private async assertModuleAccess(courseId: string, moduleId: string, user: RequestingUser) {
    const course = await this.repo.findById(courseId);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (course.instructorId !== user.id && user.role !== 'admin') throw new ForbiddenException();
    const mod = await this.repo.findModuleById(moduleId);
    if (!mod || mod.courseId !== courseId) throw new NotFoundException(t('modules.not_found'));
    return { course, mod };
  }

  private async assertLessonAccess(courseId: string, moduleId: string, lessonId: string, user: RequestingUser) {
    await this.assertModuleAccess(courseId, moduleId, user);
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson || lesson.moduleId !== moduleId) throw new NotFoundException(t('lessons.not_found'));
    return lesson;
  }

  async create(courseId: string, moduleId: string, user: RequestingUser, dto: CreateLessonDto) {
    await this.assertModuleAccess(courseId, moduleId, user);
    return this.repo.createLesson({
      moduleId,
      title: dto.title,
      contentType: dto.contentType ?? 'video',
      youtubeUrl: dto.youtubeUrl,
      description: dto.description,
      duration: dto.duration,
      resources: dto.resources,
    });
  }

  async update(courseId: string, moduleId: string, lessonId: string, user: RequestingUser, dto: UpdateLessonDto) {
    await this.assertLessonAccess(courseId, moduleId, lessonId, user);
    return this.repo.updateLesson(lessonId, {
      title: dto.title,
      contentType: dto.contentType,
      youtubeUrl: dto.youtubeUrl ?? null,
      description: dto.description ?? null,
      duration: dto.duration ?? null,
      resources: dto.resources ?? null,
    });
  }

  async remove(courseId: string, moduleId: string, lessonId: string, user: RequestingUser) {
    await this.assertLessonAccess(courseId, moduleId, lessonId, user);
    await this.repo.deleteLesson(lessonId);
  }

  async reorder(courseId: string, moduleId: string, user: RequestingUser, ids: string[]) {
    const { mod } = await this.assertModuleAccess(courseId, moduleId, user);
    const total = await this.repo.countLessonsInModule(mod.id);
    if (ids.length !== total) {
      throw new BadRequestException(t('lessons.reorder_count_mismatch'));
    }
    await this.repo.reorderLessons(moduleId, ids);
    return { reordered: ids.length };
  }

  async setVisibility(courseId: string, moduleId: string, lessonId: string, user: RequestingUser, visibility: 'visible' | 'hidden') {
    await this.assertLessonAccess(courseId, moduleId, lessonId, user);
    return this.repo.setLessonVisibility(lessonId, visibility);
  }
}
