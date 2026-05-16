import { Module } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';

@Module({
  providers: [CoursesRepository],
  exports: [CoursesRepository],
})
export class CoursesModule {}
