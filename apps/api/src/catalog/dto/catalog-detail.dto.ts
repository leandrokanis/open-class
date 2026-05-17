import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogCategoryRefDto, CatalogInstructorDto } from './catalog-list-item.dto';

export class CatalogLessonDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ enum: ['video', 'text', 'quiz'] }) contentType!: string;
  @ApiPropertyOptional({ nullable: true }) duration?: number | null;
  @ApiProperty() order!: number;
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
