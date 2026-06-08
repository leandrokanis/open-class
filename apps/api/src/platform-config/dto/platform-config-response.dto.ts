import { ApiProperty } from '@nestjs/swagger';

export class PlatformConfigResponseDto {
  @ApiProperty({ description: 'Nome da plataforma', example: 'Open Class' })
  platformName!: string;

  @ApiProperty({ description: 'URL do logotipo', example: 'https://example.com/logo.png' })
  logoUrl!: string;

  @ApiProperty({ description: 'Cor primária (hex)', example: '#3B82F6' })
  primaryColor!: string;

  @ApiProperty({ description: 'Cor secundária (hex)', example: '#1E40AF' })
  secondaryColor!: string;

  @ApiProperty({ description: 'Cor de destaque (hex)', example: '#F59E0B' })
  accentColor!: string;

  @ApiProperty({ description: 'Família tipográfica principal', example: 'Inter' })
  fontFamily!: string;

  @ApiProperty({ description: 'Família tipográfica monoespaçada', example: 'JetBrains Mono' })
  fontFamilyMono!: string;

  @ApiProperty({ description: 'Texto de apoio (eyebrow) do hero do catálogo', example: 'Plataforma open source de cursos gratuitos' })
  catalogHeroEyebrow!: string;

  @ApiProperty({ description: 'Chamada principal (headline) do hero do catálogo', example: 'Aprenda sem limites, publique sem custos.' })
  catalogHeroHeadline!: string;

  @ApiProperty({ description: 'Subtítulo do hero do catálogo', example: 'Cursos estruturados, organizados em módulos.' })
  catalogHeroSubtitle!: string;

  @ApiProperty({ description: 'Tagline do hero da página de login', example: 'Aprenda de graça, no seu ritmo.' })
  loginHeroTagline!: string;

  @ApiProperty({ description: 'Subtítulo do hero da página de login', example: 'Plataforma open source e self-hosted.' })
  loginHeroSubtitle!: string;
}
