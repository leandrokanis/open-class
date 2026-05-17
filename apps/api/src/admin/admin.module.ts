import { Module } from '@nestjs/common';
import { AdminCoursesController } from './courses/admin-courses.controller';
import { AdminCoursesService } from './courses/admin-courses.service';
import { CoursesRepository } from '../courses/courses.repository';
import { DatabaseModule } from '../db/database.module';
import { CommonModule } from '../common';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [AdminCoursesController],
  providers: [AdminCoursesService, CoursesRepository],
})
export class AdminModule {}
