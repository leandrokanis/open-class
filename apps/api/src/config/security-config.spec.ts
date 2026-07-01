import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveJwtSecret, INSECURE_JWT_SECRET } from './security-config';

describe('resolveJwtSecret', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw when running in production without JWT_SECRET', () => {
    expect(() => resolveJwtSecret({ NODE_ENV: 'production' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('should throw when production uses the insecure example secret', () => {
    expect(() =>
      resolveJwtSecret({
        NODE_ENV: 'production',
        JWT_SECRET: INSECURE_JWT_SECRET,
      }),
    ).toThrow(/JWT_SECRET/);
  });

  it('should return the secret when production provides a strong one', () => {
    const secret = 'a-genuinely-strong-production-secret';
    expect(
      resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: secret }),
    ).toBe(secret);
  });

  it('should fall back with a warning in development when JWT_SECRET is unset', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const secret = resolveJwtSecret({ NODE_ENV: 'development' });

    expect(secret).toBe(INSECURE_JWT_SECRET);
    expect(warn).toHaveBeenCalledOnce();
  });
});
