import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class ReorderLessonsDto {
  @ApiProperty({ type: [String], example: ['uuid-1', 'uuid-2', 'uuid-3'] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  ids!: string[];
}
