import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterClientDto {
  @ApiProperty({ description: 'Human-readable client name', example: 'claude.ai' })
  @IsString()
  @IsNotEmpty()
  client_name!: string;

  @ApiProperty({
    description: 'Allowed redirect URIs',
    example: ['https://claude.ai/callback'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  redirect_uris!: string[];

  @ApiPropertyOptional({ description: 'Allowed grant types', example: ['authorization_code'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grant_types?: string[];

  @ApiPropertyOptional({ description: 'Requested scope', example: 'mcp' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'Allowed response types', example: ['code'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  response_types?: string[];

  @ApiPropertyOptional({ description: 'Token endpoint auth method', example: 'none' })
  @IsOptional()
  @IsString()
  token_endpoint_auth_method?: string;

  @ApiPropertyOptional({ description: 'Client URI' })
  @IsOptional()
  @IsString()
  client_uri?: string;

  @ApiPropertyOptional({ description: 'Logo URI' })
  @IsOptional()
  @IsString()
  logo_uri?: string;

  @ApiPropertyOptional({ description: 'Contacts' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contacts?: string[];

  @ApiPropertyOptional({ description: 'Terms of service URI' })
  @IsOptional()
  @IsString()
  tos_uri?: string;

  @ApiPropertyOptional({ description: 'Policy URI' })
  @IsOptional()
  @IsString()
  policy_uri?: string;
}
