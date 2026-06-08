import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ReorderDto {
  @ApiProperty({ type: [String], description: 'IDs na nova ordem (deve conter todos os IDs existentes)' })
  @IsArray({ message: i18nValidationMessage('validation.is_array') })
  @ArrayNotEmpty({ message: i18nValidationMessage('validation.array_not_empty') })
  @IsUUID('4', { each: true, message: i18nValidationMessage('validation.is_uuid') })
  ids!: string[];
}
