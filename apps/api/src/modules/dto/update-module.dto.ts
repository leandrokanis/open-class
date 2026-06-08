import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CreateModuleDto } from './create-module.dto';

export class UpdateModuleDto extends PartialType(CreateModuleDto) {
  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: i18nValidationMessage('validation.is_boolean') })
  @IsOptional()
  isVisible?: boolean;
}
