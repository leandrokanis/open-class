import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class VisibilityDto {
  @ApiProperty({ enum: ['visible', 'hidden'] })
  @IsIn(['visible', 'hidden'])
  visibility!: 'visible' | 'hidden';
}
