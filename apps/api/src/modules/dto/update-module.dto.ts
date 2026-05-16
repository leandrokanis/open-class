import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateModuleDto } from './create-module.dto';

export class UpdateModuleDto extends PartialType(CreateModuleDto) {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
