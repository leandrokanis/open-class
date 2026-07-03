import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceDto } from './resource-response.dto';

export class LessonDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  moduleId!: string;

  @ApiProperty({ example: 'Tipos primitivos' })
  title!: string;

  @ApiPropertyOptional({ example: 'Exploração de string, number, boolean e undefined.', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  youtubeUrl!: string;

  @ApiProperty({ example: 'dQw4w9WgXcQ' })
  youtubeVideoId!: string;

  @ApiPropertyOptional({ example: 253, nullable: true, type: Number })
  durationSeconds!: number | null;

  @ApiProperty({ example: 1 })
  position!: number;

  @ApiProperty({ example: true })
  isVisible!: boolean;

  @ApiProperty({ example: false, description: 'Aula extra (bônus) do módulo' })
  isExtra!: boolean;

  @ApiPropertyOptional({ nullable: true, example: null, description: 'Turma dona da aula exclusiva (US-25)' })
  cohortId!: string | null;

  @ApiProperty({ example: '2026-05-16T18:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-16T18:00:00.000Z' })
  updatedAt!: Date;
}

export class LessonWithResourcesDto extends LessonDto {
  @ApiProperty({ type: [ResourceDto] })
  resources!: ResourceDto[];
}

export class LessonResponseDto {
  @ApiProperty({ type: LessonDto })
  data!: LessonDto;
}

export class LessonWithResourcesResponseDto {
  @ApiProperty({ type: LessonWithResourcesDto })
  data!: LessonWithResourcesDto;
}

export class LessonListResponseDto {
  @ApiProperty({ type: [LessonDto] })
  data!: LessonDto[];
}

export class ExtraUnlocksDto {
  @ApiProperty({ example: 7, description: 'Alunos matriculados que já desbloquearam as aulas extras do módulo' })
  unlockedStudents!: number;
}

export class ExtraUnlocksResponseDto {
  @ApiProperty({ type: ExtraUnlocksDto })
  data!: ExtraUnlocksDto;
}
