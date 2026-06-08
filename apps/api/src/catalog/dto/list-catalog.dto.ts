import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ListCatalogDto {
  @ApiPropertyOptional({ example: 'uuid-v4', description: 'Filtrar por categoria' })
  @IsOptional()
  @IsUUID(undefined, { message: i18nValidationMessage('validation.is_uuid') })
  categoryId?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'], description: 'Filtrar por nível' })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'], { message: i18nValidationMessage('validation.is_in') })
  level?: 'beginner' | 'intermediate' | 'advanced';

  @ApiPropertyOptional({ example: 'nestjs', description: 'Busca por título ou descrição curta' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  q?: string;

  @ApiPropertyOptional({ description: 'Cursor opaco da página anterior' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  cursor?: string;

  @ApiPropertyOptional({ example: 20, description: 'Itens por página (1–100)', minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => {
    const n = Number(value);
    if (Number.isNaN(n)) return 20;
    return Math.min(100, Math.max(1, Math.floor(n)));
  })
  @IsInt({ message: i18nValidationMessage('validation.is_int') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  @Max(100, { message: i18nValidationMessage('validation.max') })
  limit: number = 20;
}
