import { ApiProperty } from '@nestjs/swagger';

export class RecentActivityItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  lessonId!: string;

  @ApiProperty({ example: 'Funções e Escopo' })
  lessonTitle!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  courseId!: string;

  @ApiProperty({ example: 'JavaScript do Zero ao Avançado' })
  courseTitle!: string;

  @ApiProperty({ example: 'javascript-do-zero-ao-avancado' })
  courseSlug!: string;

  @ApiProperty({ example: true })
  isCompleted!: boolean;

  @ApiProperty({ example: '2026-05-18T09:14:00.000Z' })
  updatedAt!: Date;
}
