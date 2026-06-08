// Server-side: API_INTERNAL_URL (Docker network); Client-side: NEXT_PUBLIC_API_URL (browser)
const API_INTERNAL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

const API_PUBLIC = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface PlatformConfig {
  platformName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontFamilyMono: string;
  catalogHeroEyebrow: string;
  catalogHeroHeadline: string;
  catalogHeroSubtitle: string;
  loginHeroTagline: string;
  loginHeroSubtitle: string;
}

export type UpdatePlatformConfig = Partial<
  Pick<
    PlatformConfig,
    | 'platformName'
    | 'catalogHeroEyebrow'
    | 'catalogHeroHeadline'
    | 'catalogHeroSubtitle'
    | 'loginHeroTagline'
    | 'loginHeroSubtitle'
  >
>;

// Defaults mirror the API's PLATFORM_CONFIG_KEYS so the UI degrades gracefully
// if the config endpoint is unreachable.
export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  platformName: 'Open Class',
  logoUrl: '',
  primaryColor: '',
  secondaryColor: '',
  accentColor: '',
  fontFamily: '',
  fontFamilyMono: '',
  catalogHeroEyebrow: 'Plataforma open source de cursos gratuitos',
  catalogHeroHeadline: 'Aprenda sem limites, publique sem custos.',
  catalogHeroSubtitle:
    'Cursos estruturados, organizados em módulos, com acompanhamento de progresso. Grátis para sempre.',
  loginHeroTagline: 'Aprenda de graça, no seu ritmo.',
  loginHeroSubtitle: 'Plataforma open source e self-hosted.',
};

/** Server/client read of the effective platform config. Falls back to defaults. */
export async function fetchPlatformConfig(): Promise<PlatformConfig> {
  try {
    const res = await fetch(`${API_INTERNAL}/api/platform-config`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return DEFAULT_PLATFORM_CONFIG;
    return (await res.json()) as PlatformConfig;
  } catch {
    return DEFAULT_PLATFORM_CONFIG;
  }
}

/** Admin-only update of texts and platform name. */
export async function updatePlatformConfig(
  dto: UpdatePlatformConfig,
): Promise<PlatformConfig | null> {
  const res = await fetch(`${API_PUBLIC}/api/platform-config`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(dto),
  });
  if (!res.ok) return null;
  return (await res.json()) as PlatformConfig;
}

/** Admin-only logo file upload. */
export async function uploadLogo(file: File): Promise<PlatformConfig | null> {
  const form = new FormData();
  form.append('logo', file);
  const res = await fetch(`${API_PUBLIC}/api/platform-config/logo`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) return null;
  return (await res.json()) as PlatformConfig;
}
