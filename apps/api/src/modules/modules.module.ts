import { Module } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { ModulesRepository } from './modules.repository';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [ModulesController],
  providers: [ModulesService, ModulesRepository],
  exports: [ModulesRepository],
})
export class ModulesModule {}
