import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import slugify from 'slugify';
import { CoursesRepository } from './courses.repository';
import { UploadService } from './upload/upload.service';
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

  private async generateSlug(title: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let suffix = 1;
    while (await this.repo.slugExists(slug)) {
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
    });
  }

  async findMine(user: RequestingUser, page: number, limit: number) {
    return this.repo.findByInstructorId(user.id, page, limit);
  }

  async findOne(id: string, user: RequestingUser) {
    const course = await this.repo.findWithModulesAndLessons(id);
    if (!course) throw new NotFoundException('Curso não encontrado.');
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();
    return course;
  }

  async update(id: string, user: RequestingUser, dto: UpdateCourseDto) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException('Curso não encontrado.');
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();

    const update: Record<string, unknown> = {};
    if (dto.title !== undefined) {
      update.title = dto.title;
      update.slug = await this.generateSlug(dto.title);
    }
    if (dto.shortDescription !== undefined) update.shortDescription = dto.shortDescription;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.level !== undefined) update.level = dto.level;

    return this.repo.update(id, update);
  }

  async uploadThumbnail(id: string, user: RequestingUser, file: Express.Multer.File) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException('Curso não encontrado.');
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();
    if (!file) throw new BadRequestException('Arquivo de thumbnail não enviado.');

    const thumbnailUrl = this.uploadService.thumbnailUrl(file.filename);
    return this.repo.update(id, { thumbnailUrl });
  }

  async publish(id: string, user: RequestingUser) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException('Curso não encontrado.');
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();

    const visibleLessons = await this.repo.countVisibleLessons(id);
    if (visibleLessons === 0) {
      throw new BadRequestException(
        'O curso precisa ter pelo menos uma aula visível para ser publicado.',
      );
    }

    return this.repo.update(id, { status: 'published' });
  }

  async unpublish(id: string, user: RequestingUser) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException('Curso não encontrado.');
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();
    return this.repo.update(id, { status: 'draft' });
  }

  async remove(id: string, user: RequestingUser) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundException('Curso não encontrado.');
    if (!this.isOwnerOrAdmin(course, user)) throw new ForbiddenException();
    await this.repo.softDelete(id);
  }
}
