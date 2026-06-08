import {
  Injectable, NotFoundException, ForbiddenException, UnprocessableEntityException,
} from '@nestjs/common';
import { ModulesRepository } from './modules.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { t } from '../i18n/translate';
import type { CreateModuleDto } from './dto/create-module.dto';
import type { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(
    private readonly repo: ModulesRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async create(courseId: string, dto: CreateModuleDto, userId: string, userRole: string) {
    await this.assertCourseOwnership(courseId, userId, userRole);
    const position = await this.repo.nextPosition(courseId);
    return this.repo.insert({ courseId, position, visibility: 'hidden', ...dto });
  }

  async findByCourse(courseId: string) {
    const mods = await this.repo.findByCourse(courseId);
    const summaries = await this.repo.courseSummary(courseId);
    const summaryMap = new Map(summaries.map((s) => [s.moduleId, s]));
    return mods.map((m) => ({
      ...m,
      lessonsCount: summaryMap.get(m.id)?.lessonsCount ?? 0,
      totalDurationSeconds: summaryMap.get(m.id)?.totalDurationSeconds ?? 0,
    }));
  }

  async update(id: string, dto: UpdateModuleDto, userId: string, userRole: string) {
    const mod = await this.repo.findById(id);
    if (!mod) throw new NotFoundException(t('modules.not_found'));
    await this.assertCourseOwnership(mod.courseId, userId, userRole);
    return this.repo.update(id, dto);
  }

  async delete(id: string, userId: string, userRole: string) {
    const mod = await this.repo.findById(id);
    if (!mod) throw new NotFoundException(t('modules.not_found'));
    await this.assertCourseOwnership(mod.courseId, userId, userRole);
    await this.repo.delete(id);
  }

  async reorder(courseId: string, ids: string[], userId: string, userRole: string) {
    await this.assertCourseOwnership(courseId, userId, userRole);
    const currentIds = await this.repo.findAllIdsByCourse(courseId);
    this.assertSameSet(currentIds, ids, t('modules.reorder_label'));
    await Promise.all(ids.map((id, i) => this.repo.updatePosition(id, i + 1)));
    return { reordered: ids.length };
  }

  private async assertCourseOwnership(courseId: string, userId: string, userRole: string) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException(t('courses.not_found'));
    if (userRole !== 'admin' && course.instructorId !== userId) {
      throw new ForbiddenException(t('modules.no_permission'));
    }
  }

  private assertSameSet(current: string[], incoming: string[], label: string) {
    const currentSet = new Set(current);
    const incomingSet = new Set(incoming);
    if (currentSet.size !== incomingSet.size || ![...currentSet].every((id) => incomingSet.has(id))) {
      throw new UnprocessableEntityException(t('modules.reorder_set_mismatch', { label }));
    }
  }
}
