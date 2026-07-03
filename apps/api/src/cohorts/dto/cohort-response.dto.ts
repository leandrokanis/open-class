import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CohortScheduleItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  moduleId!: string;

  @ApiProperty({ example: '2026-07-08T00:00:00.000Z' })
  availableFrom!: Date;
}

export class CohortDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  courseId!: string;

  @ApiProperty({ example: 'Turma Julho 2026' })
  name!: string;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  enrollmentStart!: Date;

  @ApiProperty({ example: '2026-07-15T23:59:59.000Z' })
  enrollmentEnd!: Date;

  @ApiProperty({ example: 30 })
  seats!: number;

  @ApiPropertyOptional({ nullable: true, example: null, description: 'Data do encerramento manual' })
  closedAt!: Date | null;

  @ApiProperty({ enum: ['agendada', 'aberta', 'encerrada'], example: 'aberta', description: 'Status derivado do período e do encerramento manual' })
  status!: string;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  updatedAt!: Date;
}

export class CohortWithScheduleDto extends CohortDto {
  @ApiProperty({ type: [CohortScheduleItemDto] })
  schedule!: CohortScheduleItemDto[];
}

export class CohortResponseDto {
  @ApiProperty({ type: CohortDto })
  data!: CohortDto;
}

export class CohortWithScheduleResponseDto {
  @ApiProperty({ type: CohortWithScheduleDto })
  data!: CohortWithScheduleDto;
}

export class CohortListResponseDto {
  @ApiProperty({ type: [CohortDto] })
  data!: CohortDto[];
}

export class PublicCohortDto extends CohortDto {
  @ApiProperty({ example: 12, description: 'Vagas restantes' })
  seatsLeft!: number;

  @ApiProperty({ example: 5, description: 'Inscritos até o momento' })
  enrolledCount!: number;
}

export class PublicCohortListResponseDto {
  @ApiProperty({ type: [PublicCohortDto] })
  data!: PublicCohortDto[];
}

export class MyCohortCourseDto {
  @ApiProperty({ example: 'JavaScript do Zero' }) title!: string;
  @ApiProperty({ example: 'javascript-do-zero' }) slug!: string;
  @ApiProperty({ nullable: true, example: null }) thumbnailUrl!: string | null;
}

export class MyCohortScheduleItemDto extends CohortScheduleItemDto {
  @ApiProperty({ example: 'Fundamentos' }) moduleTitle!: string;
  @ApiProperty({ example: 1 }) modulePosition!: number;
}

export class MyCohortDto extends CohortDto {
  @ApiProperty({ type: MyCohortCourseDto }) course!: MyCohortCourseDto;
  @ApiProperty({ type: [MyCohortScheduleItemDto] }) schedule!: MyCohortScheduleItemDto[];
  @ApiProperty({ example: '2026-07-02T12:00:00.000Z' }) enrolledAt!: Date;
}

export class MyCohortListResponseDto {
  @ApiProperty({ type: [MyCohortDto] })
  data!: MyCohortDto[];
}

export class CohortProgressSummaryDto {
  @ApiProperty({ example: 18 }) enrolledCount!: number;
  @ApiProperty({ example: 12 }) seatsLeft!: number;
  @ApiProperty({ example: 47.5, description: 'Percentual médio de conclusão da turma' }) avgCompletion!: number;
}

export class CohortStudentProgressDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }) id!: string;
  @ApiProperty({ example: 'Ana Souza' }) name!: string;
  @ApiProperty({ example: 80 }) progressPct!: number;
  @ApiPropertyOptional({ nullable: true, example: 'Componentes e props' }) lastLessonTitle!: string | null;
  @ApiPropertyOptional({ nullable: true, example: '2026-07-01T12:00:00.000Z' }) lastAccessAt!: Date | null;
  @ApiProperty({ example: false, description: 'Sem acesso nos últimos 7 dias' }) inactive!: boolean;
}

export class CohortModuleCompletionDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }) moduleId!: string;
  @ApiProperty({ example: 'Fundamentos' }) title!: string;
  @ApiProperty({ example: 1 }) position!: number;
  @ApiProperty({ example: 9, description: 'Alunos da turma que concluíram o módulo' }) completedCount!: number;
}

export class CohortProgressDto {
  @ApiProperty({ type: CohortProgressSummaryDto }) summary!: CohortProgressSummaryDto;
  @ApiProperty({ type: [CohortStudentProgressDto] }) students!: CohortStudentProgressDto[];
  @ApiProperty({ type: [CohortModuleCompletionDto] }) modules!: CohortModuleCompletionDto[];
}

export class CohortProgressResponseDto {
  @ApiProperty({ type: CohortProgressDto })
  data!: CohortProgressDto;
}
