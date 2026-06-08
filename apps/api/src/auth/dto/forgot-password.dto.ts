import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.is_email') })
  email!: string;
}
