import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean, IsUrl, IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateLessonDto {
  @ApiProperty({ example: 'Tipos primitivos' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @MaxLength(255, { message: i18nValidationMessage('validation.max_length') })
  title!: string;

  @ApiPropertyOptional({ example: 'Exploração de string, number, boolean e undefined.' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsOptional()
  @MaxLength(2000, { message: i18nValidationMessage('validation.max_length') })
  description?: string;

  @ApiPropertyOptional({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsUrl({}, { message: i18nValidationMessage('validation.is_url') })
  youtubeUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean({ message: i18nValidationMessage('validation.is_boolean') })
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ example: 213, description: 'Duração da aula em segundos' })
  @IsInt({ message: i18nValidationMessage('validation.is_int') })
  @Min(0, { message: i18nValidationMessage('validation.min') })
  @IsOptional()
  duration?: number;
}
