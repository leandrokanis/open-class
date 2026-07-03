import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { CohortsController } from './cohorts.controller';
import { CohortsService } from './cohorts.service';
import { CohortsRepository } from './cohorts.repository';

@Module({
  imports: [CoursesModule],
  controllers: [CohortsController],
  providers: [CohortsService, CohortsRepository],
  exports: [CohortsService, CohortsRepository],
})
export class CohortsModule {}
