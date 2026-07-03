import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogCategoryRefDto, CatalogInstructorDto } from './catalog-list-item.dto';

export class CatalogLessonDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ enum: ['video', 'text', 'quiz'] }) contentType!: string;
  @ApiPropertyOptional({ nullable: true }) duration?: number | null;
  @ApiProperty() order!: number;
  @ApiProperty({ example: false, description: 'Aula extra (bônus) — bloqueada até concluir as normais do módulo' }) isExtra!: boolean;
  @ApiProperty({ type: [String], example: [], description: 'Turmas às quais a aula é exclusiva (US-25); vazio = regular' }) cohortIds!: string[];
}

export class CatalogModuleDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) description?: string | null;
  @ApiProperty() order!: number;
  @ApiProperty({ type: () => [CatalogLessonDto] }) lessons!: CatalogLessonDto[];
}

export class CatalogDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) shortDescription?: string | null;
  @ApiPropertyOptional({ nullable: true }) description?: string | null;
  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'], nullable: true }) level?: string | null;
  @ApiProperty({ enum: ['on_demand', 'cohort', 'both'], description: 'Modo de acesso do curso (US-22)' }) accessMode!: string;
  @ApiPropertyOptional({ nullable: true }) thumbnailUrl?: string | null;
  @ApiPropertyOptional({ type: () => CatalogCategoryRefDto, nullable: true }) category?: CatalogCategoryRefDto | null;
  @ApiProperty({ type: () => CatalogInstructorDto }) instructor!: CatalogInstructorDto;
  @ApiProperty({ type: () => [CatalogModuleDto] }) modules!: CatalogModuleDto[];
  @ApiProperty() createdAt!: Date;
}

export class CatalogDetailResponseDto {
  @ApiProperty({ type: () => CatalogDetailDto })
  data!: CatalogDetailDto;
}
