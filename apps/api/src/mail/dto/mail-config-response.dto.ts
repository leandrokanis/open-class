import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MailConfigResponseDto {
  @ApiPropertyOptional({ description: 'Hostname do servidor SMTP', example: 'smtp.example.com', nullable: true })
  host!: string | null;

  @ApiProperty({ description: 'Porta do servidor SMTP', example: 587 })
  port!: number;

  @ApiPropertyOptional({ description: 'Endereço remetente padrão', example: 'noreply@example.com', nullable: true })
  from!: string | null;

  @ApiProperty({ description: 'Se a conexão usa TLS implícito (porta 465)', example: false })
  secure!: boolean;

  @ApiProperty({ description: 'Se o SMTP está configurado (SMTP_HOST definido)', example: true })
  configured!: boolean;

  @ApiProperty({ description: 'Se a senha SMTP está definida (sem expor o valor)', example: true })
  hasPassword!: boolean;
}
