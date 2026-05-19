import { ApiProperty } from '@nestjs/swagger';

export class CatalogStatsDto {
  @ApiProperty({ example: 24, description: 'Total de cursos publicados' })
  totalCourses!: number;

  @ApiProperty({ example: 8, description: 'Total de instrutores com pelo menos um curso publicado' })
  totalInstructors!: number;

  @ApiProperty({ example: 100, description: 'Percentual de cursos gratuitos (sempre 100)' })
  percentFree!: number;
}
