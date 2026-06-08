import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsIn, IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS do Zero', maxLength: 150 })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @MaxLength(150, { message: i18nValidationMessage('validation.max_length') })
  title!: string;

  @ApiPropertyOptional({ example: 'Aprenda NestJS do zero ao avançado.', maxLength: 200 })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @MaxLength(200, { message: i18nValidationMessage('validation.max_length') })
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Descrição longa do curso...' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  description?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'] })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'], { message: i18nValidationMessage('validation.is_in') })
  level?: 'beginner' | 'intermediate' | 'advanced';

  @ApiPropertyOptional({ example: 'uuid-da-categoria', description: 'UUID da categoria do curso' })
  @IsOptional()
  @IsUUID(undefined, { message: i18nValidationMessage('validation.is_uuid') })
  categoryId?: string;
}
