import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { CohortsController } from './cohorts.controller';
import { CohortsStudentController } from './cohorts-student.controller';
import { CohortsService } from './cohorts.service';
import { CohortsRepository } from './cohorts.repository';

@Module({
  imports: [CoursesModule],
  // Student controller primeiro: garante que GET cohorts/me vença cohorts/:id
  controllers: [CohortsStudentController, CohortsController],
  providers: [CohortsService, CohortsRepository],
  exports: [CohortsService, CohortsRepository],
})
export class CohortsModule {}
