import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introdução ao NestJS', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Visão geral do módulo' })
  @IsOptional()
  @IsString()
  description?: string;
}
