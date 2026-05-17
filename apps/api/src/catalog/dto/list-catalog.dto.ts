import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListCatalogDto {
  @ApiPropertyOptional({ example: 'uuid-v4', description: 'Filtrar por categoria' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'], description: 'Filtrar por nível' })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';

  @ApiPropertyOptional({ example: 'nestjs', description: 'Busca por título ou descrição curta' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Cursor opaco da página anterior' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ example: 20, description: 'Itens por página (1–100)', minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => {
    const n = Number(value);
    if (Number.isNaN(n)) return 20;
    return Math.min(100, Math.max(1, Math.floor(n)));
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
