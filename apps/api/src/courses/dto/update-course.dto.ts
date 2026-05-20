import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiPropertyOptional({ description: 'URL da capa; null para remover', nullable: true })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string | null;
}
