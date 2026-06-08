import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Programação Web', maxLength: 100 })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @MaxLength(100, { message: i18nValidationMessage('validation.max_length') })
  name!: string;

  @ApiPropertyOptional({ example: 'Cursos sobre desenvolvimento web.' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/icons/web.svg' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  iconUrl?: string;
}
