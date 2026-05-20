import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CatalogCategoryRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

export class CatalogInstructorDto {
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
}

export class CatalogListItemDto {
  @ApiProperty({ example: 'uuid-v4' })
  id!: string;

  @ApiProperty({ example: 'NestJS do Zero' })
  title!: string;

  @ApiProperty({ example: 'nestjs-do-zero' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Aprenda NestJS do zero ao avançado.' })
  shortDescription?: string | null;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'] })
  level?: string | null;

  @ApiPropertyOptional()
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 4.8 })
  rating?: number | null;

  @ApiProperty({ example: 1200 })
  reviewCount!: number;

  @ApiProperty({ example: 36 })
  lessonCount!: number;

  @ApiProperty({ example: 120, description: 'Total de duração das aulas em minutos' })
  totalDurationMinutes!: number;

  @ApiPropertyOptional({ type: () => CatalogCategoryRefDto })
  category?: CatalogCategoryRefDto | null;

  @ApiProperty({ type: () => CatalogInstructorDto })
  instructor!: CatalogInstructorDto;

  @ApiProperty()
  createdAt!: Date;
}

export class CatalogPageMetaDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  nextCursor!: string | null;

  @ApiProperty()
  hasMore!: boolean;

  @ApiProperty()
  limit!: number;
}

export class CatalogPageDto {
  @ApiProperty({ type: () => [CatalogListItemDto] })
  data!: CatalogListItemDto[];

  @ApiProperty({ type: () => CatalogPageMetaDto })
  meta!: CatalogPageMetaDto;
}
