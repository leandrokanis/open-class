import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS do Zero', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({ example: 'Aprenda NestJS do zero ao avançado.', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Descrição longa do curso...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'] })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';
}
