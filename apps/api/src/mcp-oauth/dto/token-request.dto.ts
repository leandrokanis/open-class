import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenRequestDto {
  @ApiProperty({ example: 'authorization_code' })
  @IsString()
  @IsNotEmpty()
  grant_type!: string;

  @ApiProperty({ example: 'the-auth-code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'https://claude.ai/callback' })
  @IsString()
  @IsNotEmpty()
  redirect_uri!: string;

  @ApiPropertyOptional({ description: 'Client ID (can also be sent via Basic Auth header)' })
  @IsString()
  @IsNotEmpty()
  client_id!: string;

  @ApiPropertyOptional({ description: 'Client secret (can also be sent via Basic Auth header)' })
  @IsString()
  @IsNotEmpty()
  client_secret!: string;
}
