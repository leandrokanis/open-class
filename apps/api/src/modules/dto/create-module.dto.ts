import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introdução ao TypeScript' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @MaxLength(255, { message: i18nValidationMessage('validation.max_length') })
  title!: string;

  @ApiPropertyOptional({ example: 'Conceitos fundamentais de tipagem estática.' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsOptional()
  @MaxLength(2000, { message: i18nValidationMessage('validation.max_length') })
  description?: string;
}
