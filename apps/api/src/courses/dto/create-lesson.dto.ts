import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, MaxLength, IsOptional, IsIn, IsUrl, IsInt, Min,
  IsArray, ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Type } from 'class-transformer';

export class ResourceDto {
  @ApiProperty({ example: 'Documentação oficial' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  label!: string;

  @ApiProperty({ example: 'https://docs.nestjs.com' })
  @IsUrl({}, { message: i18nValidationMessage('validation.is_url') })
  url!: string;
}

export class CreateLessonDto {
  @ApiProperty({ example: 'Introdução ao módulo', maxLength: 255 })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @MaxLength(255, { message: i18nValidationMessage('validation.max_length') })
  title!: string;

  @ApiPropertyOptional({ enum: ['video', 'text', 'quiz'], default: 'video' })
  @IsOptional()
  @IsIn(['video', 'text', 'quiz'], { message: i18nValidationMessage('validation.is_in') })
  contentType?: 'video' | 'text' | 'quiz';

  @ApiPropertyOptional({ example: 'https://youtu.be/abc123' })
  @IsOptional()
  @IsUrl({}, { message: i18nValidationMessage('validation.is_url') })
  youtubeUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  description?: string;

  @ApiPropertyOptional({ description: 'Duração em segundos' })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage('validation.is_int') })
  @Min(0, { message: i18nValidationMessage('validation.min') })
  duration?: number;

  @ApiPropertyOptional({ type: [ResourceDto] })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage('validation.is_array') })
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  resources?: ResourceDto[];
}
