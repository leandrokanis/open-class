import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SetLessonCohortsDto {
  @ApiProperty({
    type: [String],
    description: 'Turmas às quais a aula passa a ser exclusiva (substitui a lista atual). Vazio = aula regular.',
    example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
  })
  @IsArray({ message: i18nValidationMessage('validation.is_array') })
  @IsUUID('4', { each: true, message: i18nValidationMessage('validation.is_uuid') })
  cohortIds!: string[];
}

export class LessonCohortsResponseDto {
  @ApiProperty({ type: [String], example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'] })
  cohortIds!: string[];
}
