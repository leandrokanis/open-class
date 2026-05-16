import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonsRepository } from './lessons.repository';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { ResourcesRepository } from './resources.repository';
import { YouTubeModule } from '../youtube/youtube.module';
import { ModulesModule } from '../modules/modules.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [YouTubeModule, ModulesModule, CoursesModule],
  controllers: [LessonsController, ResourcesController],
  providers: [LessonsService, LessonsRepository, ResourcesService, ResourcesRepository],
  exports: [LessonsService],
})
export class LessonsModule {}
