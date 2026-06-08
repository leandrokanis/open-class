import { IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token bruto recebido por e-mail' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  token!: string;

  @ApiProperty({ example: 'novaSenhaSegura123', minLength: 8 })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @MinLength(8, { message: i18nValidationMessage('validation.min_length') })
  password!: string;
}
