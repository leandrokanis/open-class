import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class MarkLessonDto {
  @ApiProperty({ description: 'true = marcar como concluída; false = desmarcar' })
  @IsBoolean({ message: i18nValidationMessage('validation.is_boolean') })
  isCompleted!: boolean;
}
