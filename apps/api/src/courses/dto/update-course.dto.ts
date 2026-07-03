import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiPropertyOptional({ description: 'URL da capa; null para remover', nullable: true })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    enum: ['on_demand', 'cohort', 'both'],
    description: 'Modo de acesso: on demand, somente via turma, ou ambos (US-22)',
  })
  @IsOptional()
  @IsIn(['on_demand', 'cohort', 'both'], { message: i18nValidationMessage('validation.is_enum') })
  accessMode?: 'on_demand' | 'cohort' | 'both';
}
