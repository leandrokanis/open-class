import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Maria Silva', minLength: 2, maxLength: 255 })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @MinLength(2, { message: i18nValidationMessage('validation.min_length') })
  @MaxLength(255, { message: i18nValidationMessage('validation.max_length') })
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.is_email') })
  email!: string;

  @ApiProperty({ example: 'senhaSegura123', minLength: 8 })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @MinLength(8, { message: i18nValidationMessage('validation.min_length') })
  password!: string;
}
