import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlatformConfigService } from './platform-config.service';

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([]),
  upsert: vi.fn().mockResolvedValue(undefined),
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
    const service = new PlatformConfigService(repo as never);

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
    const service = new PlatformConfigService(repo as never);

    const result = await service.getEffective();

    expect(result.platformName).toBe('Acme Corp');
  });

  it('getEffective() returns default when no DB row and no env var', async () => {
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue([]) });
    const service = new PlatformConfigService(repo as never);

    const result = await service.getEffective();

    expect(result.platformName).toBe('');
    expect(result.primaryColor).toBe('');
    expect(result.fontFamily).toBe('');
  });

  it('update() calls repo.upsert only for provided keys', async () => {
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue([]) });
    const service = new PlatformConfigService(repo as never);

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
    const service = new PlatformConfigService(repo as never);

    const result = await service.update({ platformName: 'Updated' });

    expect(result.platformName).toBe('Updated');
  });
});
