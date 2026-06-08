import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import slugify from 'slugify';
import { CoursesRepository } from './courses.repository';
import { UploadService } from '../common/upload/upload.service';
import { t } from '../i18n/translate';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';

interface RequestingUser {
  id: string;
  role: string;
}

@Injectable()
export class CoursesService {
  constructor(
    private readonly repo: CoursesRepository,
    private readonly uploadService: UploadService,
  ) {}

  private isOwnerOrAdmin(course: { instructorId: string }, user: RequestingUser) {
    return course.instructorId === user.id || user.role === 'admin';
  }

  private async generateSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true }) || 'curso';
    let slug = base;
    let suffix = 1;
    while (await this.repo.slugExists(slug, excludeId)) {
      slug = `${base}-${suffix++}`;
    }
    return slug;
  }

  async create(user: RequestingUser, dto: CreateCourseDto) {
    const slug = await this.generateSlug(dto.title);
    return this.repo.create({
      instructorId: user.id,
      title: dto.title,
      slug,
      shortDescription: dto.shortDescription,
      description: dto.description,
      level: dto.level,
      categoryId: dto.categoryId,
    });
  }

  async findMine(user: RequestingUser, page: number, limit: number) {
    if (user.role === 'admin') return this.repo.findAllWithInstructor(page, limit);
    return this.repo.findByInstructorId(user.id, page, limit);
  }

  async findOne(id: string, user: RequestingUser) {
    const course = await this.repo.findWithModulesAndLessons(id);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();
    return course;
  }

  async update(id: string, user: RequestingUser, dto: UpdateCourseDto) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();

    const update: Record<string, unknown> = {};
    if (dto.title !== undefined) {
      update.title = dto.title;
      if (course.status === 'draft') {
        update.slug = await this.generateSlug(dto.title, id);
      }
    }
    if (dto.shortDescription !== undefined) update.shortDescription = dto.shortDescription;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.level !== undefined) update.level = dto.level;
    if (dto.categoryId !== undefined) update.categoryId = dto.categoryId;
    if (dto.thumbnailUrl !== undefined) update.thumbnailUrl = dto.thumbnailUrl ?? null;

    return this.repo.update(id, update);
  }

  async uploadThumbnail(id: string, user: RequestingUser, file: Express.Multer.File) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();
    if (!file) throw new BadRequestException(t('courses.thumbnail_missing'));

    const thumbnailUrl = this.uploadService.thumbnailUrl(file.filename);
    return this.repo.update(id, { thumbnailUrl });
  }

  async publish(id: string, user: RequestingUser) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();

    const visibleLessons = await this.repo.countVisibleLessons(id);
    if (visibleLessons === 0) {
      throw new BadRequestException(t('courses.publish_requires_visible_lesson'));
    }

    return this.repo.update(id, { status: 'published' });
  }

  async unpublish(id: string, user: RequestingUser) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();
    return this.repo.update(id, { status: 'draft' });
  }

  async getInstructorStats(user: RequestingUser) {
    if (user.role === 'admin') return this.repo.getGlobalStats();
    return this.repo.getInstructorStats(user.id);
  }

  async remove(id: string, user: RequestingUser) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();
    await this.repo.softDelete(id);
  }
}
