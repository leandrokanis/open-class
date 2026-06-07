import { ApiProperty } from '@nestjs/swagger';

export class TestMailResponseDto {
  @ApiProperty({ description: 'Se o envio foi bem-sucedido', example: true })
  success!: boolean;

  @ApiProperty({ description: 'Mensagem descritiva sobre o resultado', example: 'E-mail de teste enviado com sucesso.' })
  message!: string;

  @ApiProperty({ description: 'Endereço de destino do e-mail de teste', example: 'admin@example.com' })
  sentTo!: string;
}
