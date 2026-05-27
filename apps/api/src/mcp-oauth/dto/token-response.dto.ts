import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'OAuth access token', example: 'uuid-token' })
  access_token!: string;

  @ApiProperty({ example: 'Bearer' })
  token_type!: 'Bearer';

  @ApiProperty({ description: 'Token lifetime in seconds', example: 3600 })
  expires_in!: number;

  @ApiProperty({ description: 'Granted scope', example: 'mcp' })
  scope!: string;
}
