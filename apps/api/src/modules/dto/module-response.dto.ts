import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ModuleDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  courseId!: string;

  @ApiProperty({ example: 'Introdução ao TypeScript' })
  title!: string;

  @ApiPropertyOptional({ example: 'Conceitos fundamentais de tipagem estática.', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 1 })
  position!: number;

  @ApiProperty({ example: true })
  isVisible!: boolean;

  @ApiProperty({ example: '2026-05-16T18:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-16T18:00:00.000Z' })
  updatedAt!: Date;
}

export class ModuleWithSummaryDto extends ModuleDto {
  @ApiProperty({ example: 5 })
  lessonsCount!: number;

  @ApiProperty({ example: 3600 })
  totalDurationSeconds!: number;
}

export class ModuleResponseDto {
  @ApiProperty({ type: ModuleDto })
  data!: ModuleDto;
}

export class ModuleListResponseDto {
  @ApiProperty({ type: [ModuleWithSummaryDto] })
  data!: ModuleWithSummaryDto[];
}

export class ReorderResponseDto {
  @ApiProperty({ example: { reordered: 3 } })
  data!: { reordered: number };
}
