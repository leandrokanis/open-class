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
}
