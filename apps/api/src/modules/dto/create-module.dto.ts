import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introdução ao TypeScript' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Conceitos fundamentais de tipagem estática.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}
