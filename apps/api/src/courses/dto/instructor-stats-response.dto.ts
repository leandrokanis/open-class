import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InstructorStatsResponseDto {
  @ApiProperty({ description: 'Total de alunos matriculados nos cursos do instrutor', example: 3842 })
  totalStudents!: number;

  @ApiProperty({ description: 'Número de cursos publicados', example: 7 })
  publishedCount!: number;

  @ApiPropertyOptional({ description: 'Avaliação média dos cursos (null se nenhum curso avaliado)', example: 4.8, nullable: true })
  avgRating!: number | null;

  @ApiProperty({ description: 'Novas matrículas no mês corrente', example: 184 })
  newEnrollmentsThisMonth!: number;
}
