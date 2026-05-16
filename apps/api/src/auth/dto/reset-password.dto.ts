import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token bruto recebido por e-mail' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'novaSenhaSegura123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
