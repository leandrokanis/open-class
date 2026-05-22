import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, MaxLength, IsOptional, IsIn, IsUrl, IsInt, Min,
  IsArray, ValidateNested, ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ResourceDto {
  @ApiProperty({ example: 'Documentação oficial' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: 'https://docs.nestjs.com' })
  @IsUrl()
  url!: string;
}

export class CreateLessonDto {
  @ApiProperty({ example: 'Introdução ao módulo', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ enum: ['video', 'text', 'quiz'], default: 'video' })
  @IsOptional()
  @IsIn(['video', 'text', 'quiz'])
  contentType?: 'video' | 'text' | 'quiz';

  @ApiPropertyOptional({ example: 'https://youtu.be/abc123' })
  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Duração em segundos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ type: [ResourceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  resources?: ResourceDto[];
}
