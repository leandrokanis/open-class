import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiPropertyOptional({ description: 'Senha atual (obrigatório se a conta já tem senha)' })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({ description: 'Nova senha', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
