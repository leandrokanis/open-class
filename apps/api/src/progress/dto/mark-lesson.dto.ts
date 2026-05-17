import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class MarkLessonDto {
  @ApiProperty({ description: 'true = marcar como concluída; false = desmarcar' })
  @IsBoolean()
  isCompleted!: boolean;
}
