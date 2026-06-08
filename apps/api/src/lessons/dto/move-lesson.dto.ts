import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class MoveLessonDto {
  @ApiProperty({ description: 'UUID do módulo destino', example: 'b2c3d4e5-...' })
  @IsUUID(undefined, { message: i18nValidationMessage('validation.is_uuid') })
  moduleId!: string;

  @ApiProperty({ description: 'Posição 1-based no módulo destino', example: 1 })
  @IsInt({ message: i18nValidationMessage('validation.is_int') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  position!: number;
}
