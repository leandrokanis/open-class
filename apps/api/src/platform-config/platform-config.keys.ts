export interface ConfigKeyDef {
  apiKey: string;
  dbKey: string;
  envVar: string;
  defaultValue: string;
}

export const PLATFORM_CONFIG_KEYS: ConfigKeyDef[] = [
  { apiKey: 'platformName',   dbKey: 'platform_name',    envVar: 'PLATFORM_NAME',    defaultValue: 'Open Class' },
  { apiKey: 'logoUrl',        dbKey: 'logo_url',         envVar: 'LOGO_URL',         defaultValue: '' },
  { apiKey: 'primaryColor',   dbKey: 'primary_color',    envVar: 'PRIMARY_COLOR',    defaultValue: '' },
  { apiKey: 'secondaryColor', dbKey: 'secondary_color',  envVar: 'SECONDARY_COLOR',  defaultValue: '' },
  { apiKey: 'accentColor',    dbKey: 'accent_color',     envVar: 'ACCENT_COLOR',     defaultValue: '' },
  { apiKey: 'fontFamily',     dbKey: 'font_family',      envVar: 'FONT_FAMILY',      defaultValue: '' },
  { apiKey: 'fontFamilyMono', dbKey: 'font_family_mono', envVar: 'FONT_FAMILY_MONO', defaultValue: '' },
  { apiKey: 'catalogHeroEyebrow',  dbKey: 'catalog_hero_eyebrow',  envVar: 'CATALOG_HERO_EYEBROW',  defaultValue: 'Plataforma open source de cursos gratuitos' },
  { apiKey: 'catalogHeroHeadline', dbKey: 'catalog_hero_headline', envVar: 'CATALOG_HERO_HEADLINE', defaultValue: 'Aprenda sem limites, publique sem custos.' },
  { apiKey: 'catalogHeroSubtitle', dbKey: 'catalog_hero_subtitle', envVar: 'CATALOG_HERO_SUBTITLE', defaultValue: 'Cursos estruturados, organizados em módulos, com acompanhamento de progresso. Grátis para sempre.' },
  { apiKey: 'loginHeroTagline',    dbKey: 'login_hero_tagline',    envVar: 'LOGIN_HERO_TAGLINE',    defaultValue: 'Aprenda de graça, no seu ritmo.' },
  { apiKey: 'loginHeroSubtitle',   dbKey: 'login_hero_subtitle',   envVar: 'LOGIN_HERO_SUBTITLE',   defaultValue: 'Plataforma open source e self-hosted.' },
];
