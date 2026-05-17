import { Injectable } from '@nestjs/common';
import { CoursesRepository } from '../../courses/courses.repository';

@Injectable()
export class AdminCoursesService {
  constructor(private readonly coursesRepo: CoursesRepository) {}

  listAll(
    page: number,
    limit: number,
    filters: { status?: 'draft' | 'published'; instructorId?: string },
  ) {
    return this.coursesRepo.findAll(page, limit, filters);
  }
}
