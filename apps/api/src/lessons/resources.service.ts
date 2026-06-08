import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourcesRepository } from './resources.repository';
import { LessonsService } from './lessons.service';
import { t } from '../i18n/translate';
import type { CreateResourceDto } from './dto/create-resource.dto';
import type { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly repo: ResourcesRepository,
    private readonly lessonsService: LessonsService,
  ) {}

  async create(lessonId: string, dto: CreateResourceDto, userId: string, userRole: string) {
    await this.lessonsService.assertLessonOwnership(lessonId, userId, userRole);
    const position = await this.repo.nextPosition(lessonId);
    return this.repo.insert({ lessonId, title: dto.title, url: dto.url, position });
  }

  async update(
    id: string,
    lessonId: string,
    dto: UpdateResourceDto,
    userId: string,
    userRole: string,
  ) {
    const resource = await this.repo.findById(id);
    if (!resource || resource.lessonId !== lessonId) {
      throw new NotFoundException(t('lessons.resource_not_found'));
    }
    await this.lessonsService.assertLessonOwnership(lessonId, userId, userRole);
    return this.repo.update(id, { title: dto.title, url: dto.url });
  }

  async delete(id: string, lessonId: string, userId: string, userRole: string) {
    const resource = await this.repo.findById(id);
    if (!resource || resource.lessonId !== lessonId) {
      throw new NotFoundException(t('lessons.resource_not_found'));
    }
    await this.lessonsService.assertLessonOwnership(lessonId, userId, userRole);
    await this.repo.delete(id);
  }
}
