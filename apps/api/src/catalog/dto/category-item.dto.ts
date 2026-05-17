import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) description?: string | null;
  @ApiPropertyOptional({ nullable: true }) iconUrl?: string | null;
}

export class CategoriesResponseDto {
  @ApiProperty({ type: () => [CategoryItemDto] })
  data!: CategoryItemDto[];
}
