import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { CoursesRepository } from '../courses.repository';
import { t } from '../../i18n/translate';
import type { CreateModuleDto } from '../dto/create-module.dto';
import type { UpdateModuleDto } from '../dto/update-module.dto';

interface RequestingUser { id: string; role: string }

@Injectable()
export class ModulesService {
  constructor(private readonly repo: CoursesRepository) {}

  private async assertCourseAccess(courseId: string, user: RequestingUser) {
    const course = await this.repo.findById(courseId);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (course.instructorId !== user.id && user.role !== 'admin') throw new ForbiddenException();
    return course;
  }

  private async assertModuleAccess(courseId: string, moduleId: string, user: RequestingUser) {
    await this.assertCourseAccess(courseId, user);
    const mod = await this.repo.findModuleById(moduleId);
    if (!mod || mod.courseId !== courseId) throw new NotFoundException(t('modules.not_found'));
    return mod;
  }

  async create(courseId: string, user: RequestingUser, dto: CreateModuleDto) {
    await this.assertCourseAccess(courseId, user);
    return this.repo.createModule({ courseId, title: dto.title, description: dto.description });
  }

  async update(courseId: string, moduleId: string, user: RequestingUser, dto: UpdateModuleDto) {
    await this.assertModuleAccess(courseId, moduleId, user);
    return this.repo.updateModule(moduleId, dto);
  }

  async remove(courseId: string, moduleId: string, user: RequestingUser, force: boolean) {
    await this.assertModuleAccess(courseId, moduleId, user);
    const lessonCount = await this.repo.countLessonsInModule(moduleId);
    if (lessonCount > 0 && !force) {
      throw new ConflictException(t('modules.has_lessons'));
    }
    await this.repo.deleteModule(moduleId);
  }

  async reorder(courseId: string, user: RequestingUser, ids: string[]) {
    await this.assertCourseAccess(courseId, user);
    const total = await this.repo.countModulesInCourse(courseId);
    if (ids.length !== total) {
      throw new BadRequestException(t('modules.reorder_count_mismatch'));
    }
    await this.repo.reorderModules(courseId, ids);
    return { reordered: ids.length };
  }

  async setVisibility(courseId: string, moduleId: string, user: RequestingUser, visibility: 'visible' | 'hidden') {
    await this.assertModuleAccess(courseId, moduleId, user);
    return this.repo.setModuleVisibility(moduleId, visibility);
  }
}
