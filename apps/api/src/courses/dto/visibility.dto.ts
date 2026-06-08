import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class VisibilityDto {
  @ApiProperty({ enum: ['visible', 'hidden'] })
  @IsIn(['visible', 'hidden'], { message: i18nValidationMessage('validation.is_in') })
  visibility!: 'visible' | 'hidden';
}
