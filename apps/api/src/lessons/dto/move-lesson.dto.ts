import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class MoveLessonDto {
  @ApiProperty({ description: 'UUID do módulo destino', example: 'b2c3d4e5-...' })
  @IsUUID()
  moduleId!: string;

  @ApiProperty({ description: 'Posição 1-based no módulo destino', example: 1 })
  @IsInt()
  @Min(1)
  position!: number;
}
