import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import { UploadService } from '../common/upload/upload.service';
import { ModulesController } from './modules/modules.controller';
import { ModulesService } from './modules/modules.service';
import { LessonsController } from './lessons/lessons.controller';
import { LessonsService } from './lessons/lessons.service';
import { DatabaseModule } from '../db/database.module';
import { CommonModule } from '../common';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [CoursesController, ModulesController, LessonsController],
  providers: [CoursesService, CoursesRepository, UploadService, ModulesService, LessonsService],
  exports: [CoursesRepository, CoursesService],
})
export class CoursesModule {}
