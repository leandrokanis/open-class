import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterClientResponseDto {
  @ApiProperty({ description: 'OAuth client ID', example: 'a1b2c3d4-...' })
  client_id!: string;

  @ApiPropertyOptional({ description: 'OAuth client secret — omitted for token_endpoint_auth_method=none', example: 'e5f6g7h8-...' })
  client_secret?: string;

  @ApiProperty({ description: 'Human-readable client name', example: 'claude.ai' })
  client_name!: string;

  @ApiProperty({ description: 'Registered redirect URIs', type: [String] })
  redirect_uris!: string[];

  @ApiProperty({ description: 'Allowed grant types', type: [String] })
  grant_types!: string[];

  @ApiProperty({ description: 'Granted scope', example: 'mcp' })
  scope!: string;
}
