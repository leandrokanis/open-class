import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import { UploadService } from './upload/upload.service';
import { RolesGuard } from './guards/roles.guard';
import { ModulesController } from './modules/modules.controller';
import { ModulesService } from './modules/modules.service';
import { LessonsController } from './lessons/lessons.controller';
import { LessonsService } from './lessons/lessons.service';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CoursesController, ModulesController, LessonsController],
  providers: [CoursesService, CoursesRepository, UploadService, RolesGuard, ModulesService, LessonsService],
})
export class CoursesModule {}
