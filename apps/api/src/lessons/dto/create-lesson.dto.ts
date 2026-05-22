import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean, IsUrl, IsInt, Min } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Tipos primitivos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Exploração de string, number, boolean e undefined.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'youtubeUrl deve ser uma URL válida.' })
  youtubeUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ example: 213, description: 'Duração da aula em segundos' })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;
}
