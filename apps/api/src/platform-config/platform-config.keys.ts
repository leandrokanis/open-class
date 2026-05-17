export interface ConfigKeyDef {
  apiKey: string;
  dbKey: string;
  envVar: string;
  defaultValue: string;
}

export const PLATFORM_CONFIG_KEYS: ConfigKeyDef[] = [
  { apiKey: 'platformName',   dbKey: 'platform_name',    envVar: 'PLATFORM_NAME',    defaultValue: '' },
  { apiKey: 'logoUrl',        dbKey: 'logo_url',         envVar: 'LOGO_URL',         defaultValue: '' },
  { apiKey: 'primaryColor',   dbKey: 'primary_color',    envVar: 'PRIMARY_COLOR',    defaultValue: '' },
  { apiKey: 'secondaryColor', dbKey: 'secondary_color',  envVar: 'SECONDARY_COLOR',  defaultValue: '' },
  { apiKey: 'accentColor',    dbKey: 'accent_color',     envVar: 'ACCENT_COLOR',     defaultValue: '' },
  { apiKey: 'fontFamily',     dbKey: 'font_family',      envVar: 'FONT_FAMILY',      defaultValue: '' },
  { apiKey: 'fontFamilyMono', dbKey: 'font_family_mono', envVar: 'FONT_FAMILY_MONO', defaultValue: '' },
];
