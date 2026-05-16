import { ApiProperty } from '@nestjs/swagger';

export class ResourceDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  lessonId!: string;

  @ApiProperty({ example: 'Documentação oficial TypeScript' })
  title!: string;

  @ApiProperty({ example: 'https://www.typescriptlang.org/docs/' })
  url!: string;

  @ApiProperty({ example: 1 })
  position!: number;

  @ApiProperty({ example: '2026-05-16T18:00:00.000Z' })
  createdAt!: Date;
}

export class ResourceResponseDto {
  @ApiProperty({ type: ResourceDto })
  data!: ResourceDto;
}
