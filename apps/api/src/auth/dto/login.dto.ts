import { IsEmail, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.is_email') })
  email!: string;

  @ApiProperty({ example: 'senhaSegura123' })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  password!: string;
}
