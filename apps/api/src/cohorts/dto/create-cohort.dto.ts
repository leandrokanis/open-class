import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsDateString, IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCohortDto {
  @ApiProperty({ example: 'Turma Julho 2026' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @MaxLength(255, { message: i18nValidationMessage('validation.max_length') })
  name!: string;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z', description: 'Início do período de inscrições (ISO 8601)' })
  @IsDateString({}, { message: i18nValidationMessage('validation.is_date') })
  enrollmentStart!: string;

  @ApiProperty({ example: '2026-07-15T23:59:59.000Z', description: 'Fim do período de inscrições (ISO 8601)' })
  @IsDateString({}, { message: i18nValidationMessage('validation.is_date') })
  enrollmentEnd!: string;

  @ApiProperty({ example: 30, minimum: 1, description: 'Vagas disponíveis' })
  @IsInt({ message: i18nValidationMessage('validation.is_int') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  seats!: number;
}
