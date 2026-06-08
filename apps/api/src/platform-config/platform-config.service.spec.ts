import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlatformConfigService } from './platform-config.service';

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([]),
  upsert: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeUpload = (overrides = {}) => ({
  publicUrl: vi.fn((subdir: string, filename: string) => `http://localhost:3001/uploads/${subdir}/${filename}`),
  ...overrides,
});

describe('PlatformConfigService', () => {
  let originalPlatformName: string | undefined;

  beforeEach(() => {
    originalPlatformName = process.env.PLATFORM_NAME;
    delete process.env.PLATFORM_NAME;
  });

  afterEach(() => {
    if (originalPlatformName !== undefined) {
      process.env.PLATFORM_NAME = originalPlatformName;
    } else {
      delete process.env.PLATFORM_NAME;
    }
  });

  it('getEffective() returns DB values when no env vars set', async () => {
    const repo = makeRepo({
      findAll: vi.fn().mockResolvedValue([
        { key: 'platform_name', value: 'Open Class', label: null, description: null, updatedAt: new Date() },
      ]),
    });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    const result = await service.getEffective();

    expect(result.platformName).toBe('Open Class');
    expect(result.logoUrl).toBe('');
  });

  it('getEffective() env var overrides DB value', async () => {
    process.env.PLATFORM_NAME = 'Acme Corp';
    const repo = makeRepo({
      findAll: vi.fn().mockResolvedValue([
        { key: 'platform_name', value: 'Open Class', label: null, description: null, updatedAt: new Date() },
      ]),
    });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    const result = await service.getEffective();

    expect(result.platformName).toBe('Acme Corp');
  });

  it('getEffective() returns default when no DB row and no env var', async () => {
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue([]) });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    const result = await service.getEffective();

    expect(result.platformName).toBe('Open Class');
    expect(result.primaryColor).toBe('');
    expect(result.fontFamily).toBe('');
  });

  it('getEffective() returns default catalog and login hero texts when no DB row', async () => {
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue([]) });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    const result = await service.getEffective();

    expect(result.catalogHeroEyebrow).toBe('Plataforma open source de cursos gratuitos');
    expect(result.catalogHeroHeadline).toBe('Aprenda sem limites, publique sem custos.');
    expect(result.loginHeroTagline).toBe('Aprenda de graça, no seu ritmo.');
    expect(result.loginHeroSubtitle).toBe('Plataforma open source e self-hosted.');
  });

  it('getEffective() returns DB value for a catalog hero text key', async () => {
    const repo = makeRepo({
      findAll: vi.fn().mockResolvedValue([
        { key: 'catalog_hero_headline', value: 'Minha headline', label: null, description: null, updatedAt: new Date() },
      ]),
    });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    const result = await service.getEffective();

    expect(result.catalogHeroHeadline).toBe('Minha headline');
  });

  it('update() upserts only the provided text keys', async () => {
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue([]) });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    await service.update({ catalogHeroHeadline: 'Nova', loginHeroTagline: 'Tagline' });

    expect(repo.upsert).toHaveBeenCalledTimes(2);
    expect(repo.upsert).toHaveBeenCalledWith('catalog_hero_headline', 'Nova');
    expect(repo.upsert).toHaveBeenCalledWith('login_hero_tagline', 'Tagline');
  });

  it('getEffective() empty DB value falls back to default', async () => {
    const repo = makeRepo({
      findAll: vi.fn().mockResolvedValue([
        { key: 'catalog_hero_headline', value: '', label: null, description: null, updatedAt: new Date() },
      ]),
    });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    const result = await service.getEffective();

    expect(result.catalogHeroHeadline).toBe('Aprenda sem limites, publique sem custos.');
  });

  it('update() calls repo.upsert only for provided keys', async () => {
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue([]) });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    await service.update({ platformName: 'Test School' });

    expect(repo.upsert).toHaveBeenCalledTimes(1);
    expect(repo.upsert).toHaveBeenCalledWith('platform_name', 'Test School');
  });

  it('update() returns effective config after upsert', async () => {
    const repo = makeRepo({
      findAll: vi.fn().mockResolvedValue([
        { key: 'platform_name', value: 'Updated', label: null, description: null, updatedAt: new Date() },
      ]),
    });
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    const result = await service.update({ platformName: 'Updated' });

    expect(result.platformName).toBe('Updated');
  });

  it('updateLogo() persists the public URL and returns it', async () => {
    const url = 'http://localhost:3001/uploads/logos/abc.png';
    const repo = makeRepo({
      findAll: vi.fn().mockResolvedValue([
        { key: 'logo_url', value: url, label: null, description: null, updatedAt: new Date() },
      ]),
    });
    const upload = makeUpload();
    const service = new PlatformConfigService(repo as never, upload as never);

    const result = await service.updateLogo({ filename: 'abc.png' } as never);

    expect(upload.publicUrl).toHaveBeenCalledWith('logos', 'abc.png');
    expect(repo.upsert).toHaveBeenCalledWith('logo_url', url);
    expect(result.logoUrl).toBe(url);
  });

  it('updateLogo() rejects when no file is sent', async () => {
    const repo = makeRepo();
    const service = new PlatformConfigService(repo as never, makeUpload() as never);

    await expect(service.updateLogo(undefined as never)).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });
});
