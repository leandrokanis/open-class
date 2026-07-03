import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResourceResponseDto {
  @ApiProperty({ example: 'Documentação oficial' })
  label!: string;

  @ApiProperty({ example: 'https://docs.nestjs.com' })
  url!: string;
}

export class LessonResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id!: string;

  @ApiProperty({ example: 'uuid-v4' })
  moduleId!: string;

  @ApiProperty({ example: 'Introdução ao NestJS' })
  title!: string;

  @ApiProperty({ enum: ['video', 'text', 'quiz'], example: 'video' })
  contentType!: string;

  @ApiPropertyOptional({ example: 'https://www.youtube.com/watch?v=abc123' })
  youtubeUrl?: string | null;

  @ApiPropertyOptional({ example: 'Descrição da aula.' })
  description?: string | null;

  @ApiPropertyOptional({ example: 3600, description: 'Duração em segundos' })
  duration?: number | null;

  @ApiProperty({ enum: ['visible', 'hidden'], example: 'visible' })
  visibility!: string;

  @ApiProperty({ type: () => [ResourceResponseDto] })
  resources!: ResourceResponseDto[];

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ModuleResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id!: string;

  @ApiProperty({ example: 'uuid-v4' })
  courseId!: string;

  @ApiProperty({ example: 'Fundamentos' })
  title!: string;

  @ApiPropertyOptional({ example: 'Descrição do módulo.' })
  description?: string | null;

  @ApiProperty({ enum: ['visible', 'hidden'], example: 'visible' })
  visibility!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ type: () => [LessonResponseDto] })
  lessons!: LessonResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CourseResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id!: string;

  @ApiProperty({ example: 'NestJS do Zero' })
  title!: string;

  @ApiProperty({ example: 'nestjs-do-zero' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Aprenda NestJS do zero ao avançado.' })
  shortDescription?: string | null;

  @ApiPropertyOptional({ example: 'Descrição longa do curso...' })
  description?: string | null;

  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'], example: 'beginner', nullable: true })
  level!: string | null;

  @ApiProperty({ enum: ['draft', 'published'], example: 'draft' })
  status!: string;

  @ApiProperty({ enum: ['on_demand', 'cohort', 'both'], example: 'on_demand', description: 'Modo de acesso do curso (US-22)' })
  accessMode!: string;

  @ApiPropertyOptional({ example: 'http://localhost:3001/uploads/thumbnails/uuid-ts.jpg' })
  thumbnailUrl?: string | null;

  @ApiProperty({ example: 'uuid-v4' })
  instructorId!: string;

  @ApiProperty({ type: () => [ModuleResponseDto] })
  modules!: ModuleResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CourseListItemDto {
  @ApiProperty({ example: 'uuid-v4' })
  id!: string;

  @ApiProperty({ example: 'NestJS do Zero' })
  title!: string;

  @ApiProperty({ example: 'nestjs-do-zero' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Aprenda NestJS do zero ao avançado.' })
  shortDescription?: string | null;

  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'], nullable: true })
  level!: string | null;

  @ApiProperty({ enum: ['draft', 'published'], example: 'draft' })
  status!: string;

  @ApiPropertyOptional()
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ example: 'João Silva', description: 'Nome do instrutor dono do curso (presente apenas na listagem do admin)' })
  instructorName?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedCoursesDto {
  @ApiProperty({ type: () => [CourseListItemDto] })
  data!: CourseListItemDto[];

  @ApiProperty({ example: { page: 1, limit: 20, total: 42 } })
  meta!: { page: number; limit: number; total: number };
}

export class CourseDataDto {
  @ApiProperty({ type: () => CourseResponseDto })
  data!: CourseResponseDto;
}

export class ModuleDataDto {
  @ApiProperty({ type: () => ModuleResponseDto })
  data!: ModuleResponseDto;
}

export class LessonDataDto {
  @ApiProperty({ type: () => LessonResponseDto })
  data!: LessonResponseDto;
}

export class ThumbnailUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Imagem (JPEG, PNG ou WebP, máx 2 MB)' })
  thumbnail!: unknown;
}
