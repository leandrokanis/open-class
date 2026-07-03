import { ApiProperty } from '@nestjs/swagger';

export class ModuleExtrasStatusDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  moduleId!: string;

  @ApiProperty({ example: true, description: 'O módulo possui aulas extras visíveis' })
  hasExtras!: boolean;

  @ApiProperty({ example: false, description: 'O aluno concluiu todas as aulas normais do módulo' })
  unlocked!: boolean;

  @ApiProperty({ example: false, description: 'O modal de celebração já foi exibido para este módulo' })
  celebrated!: boolean;
}

export class ExtrasStatusResponseDto {
  @ApiProperty({ type: [ModuleExtrasStatusDto] })
  data!: ModuleExtrasStatusDto[];
}

export class CelebrationDto {
  @ApiProperty({ example: true })
  celebrated!: boolean;
}

export class CelebrationResponseDto {
  @ApiProperty({ type: CelebrationDto })
  data!: CelebrationDto;
}
