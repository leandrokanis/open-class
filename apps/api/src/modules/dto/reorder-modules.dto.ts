import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ReorderModulesDto {
  @ApiProperty({ type: [String], example: ['uuid-1', 'uuid-2', 'uuid-3'] })
  @IsArray({ message: i18nValidationMessage('validation.is_array') })
  @ArrayNotEmpty({ message: i18nValidationMessage('validation.array_not_empty') })
  @ArrayUnique({ message: i18nValidationMessage('validation.array_unique') })
  @IsUUID('4', { each: true, message: i18nValidationMessage('validation.is_uuid') })
  ids!: string[];
}
