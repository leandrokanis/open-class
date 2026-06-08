import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsUrl } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateResourceDto {
  @ApiProperty({ example: 'Documentação oficial TypeScript' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @MaxLength(255, { message: i18nValidationMessage('validation.max_length') })
  title!: string;

  @ApiProperty({ example: 'https://www.typescriptlang.org/docs/' })
  @IsUrl({}, { message: i18nValidationMessage('validation.is_url') })
  url!: string;
}
