import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsRepository } from './enrollments.repository';
import { ProgressModule } from '../progress/progress.module';
import { CommonModule } from '../common';

@Module({
  imports: [CommonModule, ProgressModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentsRepository],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
