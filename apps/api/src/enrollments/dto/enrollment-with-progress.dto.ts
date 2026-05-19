import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EnrollmentCategoryDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'Desenvolvimento Web' })
  name!: string;

  @ApiProperty({ example: 'desenvolvimento-web' })
  slug!: string;
}

class EnrollmentInstructorDto {
  @ApiProperty({ example: 'Carlos Mendes' })
  name!: string;
}

class EnrollmentCourseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'JavaScript do Zero ao Avançado' })
  title!: string;

  @ApiProperty({ example: 'javascript-do-zero-ao-avancado' })
  slug!: string;

  @ApiPropertyOptional({ example: 'intermediate', enum: ['beginner', 'intermediate', 'advanced'], nullable: true })
  level!: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg', nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty({ example: 1960, description: 'Duração total em minutos' })
  totalDurationMinutes!: number;

  @ApiPropertyOptional({ type: EnrollmentCategoryDto, nullable: true })
  category!: EnrollmentCategoryDto | null;

  @ApiProperty({ type: EnrollmentInstructorDto })
  instructor!: EnrollmentInstructorDto;
}

class EnrollmentProgressDto {
  @ApiProperty({ example: 30 })
  completedLessons!: number;

  @ApiProperty({ example: 48 })
  totalLessons!: number;

  @ApiProperty({ example: 62.5, description: 'Percentual de conclusão (0–100)' })
  percentage!: number;
}

class LastLessonDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'Funções e Escopo' })
  title!: string;
}

export class EnrollmentWithProgressDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'active', enum: ['active', 'completed', 'cancelled'] })
  status!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  enrolledAt!: Date;

  @ApiProperty({ type: EnrollmentCourseDto })
  course!: EnrollmentCourseDto;

  @ApiProperty({ type: EnrollmentProgressDto })
  progress!: EnrollmentProgressDto;

  @ApiPropertyOptional({ type: LastLessonDto, nullable: true })
  lastLesson!: LastLessonDto | null;
}
