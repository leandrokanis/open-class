import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ReorderCategoriesDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'Lista completa de IDs na nova ordem' })
  @IsArray({ message: i18nValidationMessage('validation.is_array') })
  @IsUUID('4', { each: true, message: i18nValidationMessage('validation.is_uuid') })
  ids!: string[];
}
