import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

const HEX_COLOR_REGEX = /^(#([0-9A-Fa-f]{3}){1,2})?$/;

export class UpdatePlatformConfigDto {
  @ApiPropertyOptional({ description: 'Nome da plataforma', example: 'Open Class' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  platformName?: string;

  @ApiPropertyOptional({ description: 'URL do logotipo', example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Cor primária (hex)', example: '#3B82F6' })
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: 'primaryColor must be a valid hex color or empty string' })
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Cor secundária (hex)', example: '#1E40AF' })
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: 'secondaryColor must be a valid hex color or empty string' })
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Cor de destaque (hex)', example: '#F59E0B' })
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: 'accentColor must be a valid hex color or empty string' })
  accentColor?: string;

  @ApiPropertyOptional({ description: 'Família tipográfica principal', example: 'Inter' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fontFamily?: string;

  @ApiPropertyOptional({ description: 'Família tipográfica monoespaçada', example: 'JetBrains Mono' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fontFamilyMono?: string;

  @ApiPropertyOptional({ description: 'Texto de apoio (eyebrow) do hero do catálogo', example: 'Plataforma open source de cursos gratuitos' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  catalogHeroEyebrow?: string;

  @ApiPropertyOptional({ description: 'Chamada principal (headline) do hero do catálogo', example: 'Aprenda sem limites, publique sem custos.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  catalogHeroHeadline?: string;

  @ApiPropertyOptional({ description: 'Subtítulo do hero do catálogo', example: 'Cursos estruturados, organizados em módulos.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  catalogHeroSubtitle?: string;

  @ApiPropertyOptional({ description: 'Tagline do hero da página de login', example: 'Aprenda de graça, no seu ritmo.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  loginHeroTagline?: string;

  @ApiPropertyOptional({ description: 'Subtítulo do hero da página de login', example: 'Plataforma open source e self-hosted.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  loginHeroSubtitle?: string;
}
