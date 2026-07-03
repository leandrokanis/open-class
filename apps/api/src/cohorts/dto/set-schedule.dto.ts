import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsUUID, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ScheduleEntryDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID('4', { message: i18nValidationMessage('validation.is_uuid') })
  moduleId!: string;

  @ApiProperty({ example: '2026-07-08T00:00:00.000Z', description: 'Data a partir da qual o módulo fica disponível' })
  @IsDateString({}, { message: i18nValidationMessage('validation.is_date') })
  availableFrom!: string;
}

export class SetScheduleDto {
  @ApiProperty({ type: [ScheduleEntryDto] })
  @IsArray({ message: i18nValidationMessage('validation.is_array') })
  @ValidateNested({ each: true })
  @Type(() => ScheduleEntryDto)
  entries!: ScheduleEntryDto[];
}
